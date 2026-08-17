from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.database import get_db
from app.models.location import Location
from app.schemas.location import LocationResponse, LocationTreeItem
from app.data_sources.air.mock_seed import SEED_LOCATIONS

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("", response_model=List[LocationResponse])
def list_locations(
    level: Optional[str] = Query(None, description="COUNTRY, STATE, CITY, STATION"),
    parent_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    List spatial locations matching level or parent_id filter.
    Falls back to seed locations if database is empty.
    """
    query = db.query(Location)
    if level:
        query = query.filter(Location.level == level.upper())
    if parent_id:
        query = query.filter(Location.parent_id == parent_id)

    locations = query.all()
    
    if not locations and not level and not parent_id:
        # DB not seeded yet, return SEED_LOCATIONS array
        return [LocationResponse(**loc) for loc in SEED_LOCATIONS]
    
    return [LocationResponse.model_validate(loc) for loc in locations]

@router.get("/tree", response_model=List[LocationTreeItem])
def get_location_tree(db: Session = Depends(get_db)):
    """
    Return full hierarchical spatial location tree (Country -> State -> City -> Station).
    """
    locations = db.query(Location).all()
    if not locations:
        raw_list = SEED_LOCATIONS
    else:
        raw_list = [loc.to_dict() for loc in locations]

    # Build hierarchical tree structure in memory
    node_map = {item["id"]: {**item, "children": []} for item in raw_list}
    tree = []

    for item in raw_list:
        parent_id = item.get("parent_id")
        if parent_id and parent_id in node_map:
            node_map[parent_id]["children"].append(node_map[item["id"]])
        else:
            if item.get("level") == "COUNTRY":
                tree.append(node_map[item["id"]])

    return tree

@router.get("/{location_id}", response_model=LocationResponse)
def get_location_by_id(location_id: str, db: Session = Depends(get_db)):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        # Check seed locations array
        for loc in SEED_LOCATIONS:
            if loc["id"] == location_id:
                return LocationResponse(**loc)
        raise HTTPException(status_code=404, detail=f"Location '{location_id}' not found")
    return LocationResponse.model_validate(location)
