"""Pydantic models for fun requests and responses."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class FunBase(BaseModel):
    """Base fun schema."""
    title: str = Field(..., min_length=1, max_length=100, description="娱乐项目名称")
    content: Optional[str] = Field(None, max_length=1000, description="娱乐项目介绍/体验/评价")
    cover: Optional[str] = Field(None, max_length=255, description="封面图URL")
    images: List[str] = Field(default_factory=list, description="图片URL集合")
    tags: List[str] = Field(default_factory=list, description="标签")
    star: Optional[int] = Field(None, ge=1, le=5, description="1-5星评分")
    maker: str = Field(..., min_length=1, max_length=50, description="推荐来源/推荐人")
    flavor: Optional[str] = Field(None, max_length=50, description="类型/风格")


class FunCreate(FunBase):
    """Request model for fun creation."""
    pass


class FunUpdate(BaseModel):
    """Request model for fun updates."""
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    content: Optional[str] = Field(None, max_length=1000)
    cover: Optional[str] = Field(None, max_length=255)
    images: Optional[List[str]] = None
    tags: Optional[List[str]] = None
    star: Optional[int] = Field(None, ge=1, le=5)
    maker: Optional[str] = Field(None, min_length=1, max_length=50)
    flavor: Optional[str] = Field(None, max_length=50)


class FunOut(FunBase):
    """Response model for fun data."""
    id: str
    create_time: datetime
    update_time: datetime
    created_by: str
    updated_by: str

    class Config:
        from_attributes = True
