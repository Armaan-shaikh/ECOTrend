from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.core.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    level = Column(String(32), nullable=False, index=True) # COUNTRY, STATE, CITY, STATION
    parent_id = Column(String(64), ForeignKey("locations.id", ondelete="CASCADE"), nullable=True, index=True)
    country_code = Column(String(8), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Self-referencing hierarchy relationships
    parent = relationship("Location", remote_side=[id], backref="children")
    measurements = relationship("EnvironmentalMeasurement", back_populates="location", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "level": self.level,
            "parent_id": self.parent_id,
            "country_code": self.country_code,
            "latitude": self.latitude,
            "longitude": self.longitude,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
