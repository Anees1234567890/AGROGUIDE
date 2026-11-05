from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime


class CommentBase(BaseModel):
    content: str = Field(..., min_length=2, max_length=1000)


class CommentCreate(CommentBase):
    pass


class CommentAuthor(BaseModel):
    id: int
    name: str
    role: str
    state: Optional[str] = None
    district: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class CommentResponse(CommentBase):
    id: int
    post_id: int
    user_id: int
    created_at: datetime
    author: Optional[CommentAuthor] = None

    model_config = ConfigDict(from_attributes=True)


class CommunityPostBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    content: str = Field(..., min_length=10)
    category: str = "General Farming"  # Crop, Soil, Pest, Weather, Market, General Farming


class CommunityPostCreate(CommunityPostBase):
    pass


class CommunityPostResponse(CommunityPostBase):
    id: int
    user_id: int
    likes_count: int
    comments_count: int
    is_pinned: bool
    created_at: datetime
    author: Optional[CommentAuthor] = None
    comments: List[CommentResponse] = []
    has_liked: Optional[bool] = False

    model_config = ConfigDict(from_attributes=True)


class CommunityPostListResponse(BaseModel):
    total: int
    page: int
    limit: int
    posts: List[CommunityPostResponse]

