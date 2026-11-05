from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
import math
from app.database.session import get_db
from app.models.community import CommunityPost, Comment, PostLike
from app.models.user import User
from app.schemas.community import (
    CommunityPostCreate,
    CommunityPostResponse,
    CommunityPostListResponse,
    CommentCreate,
    CommentResponse,
    CommentAuthor,
)
from app.auth.dependencies import get_current_user, get_optional_user

router = APIRouter(prefix="/community", tags=["Farmer Community"])


@router.get("/posts", response_model=CommunityPostListResponse)
def list_posts(
    db: Session = Depends(get_db),
    category: Optional[str] = Query(None),
    query: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(15, ge=1, le=50),
    current_user: Optional[User] = Depends(get_optional_user)
):
    q = db.query(CommunityPost).filter(CommunityPost.is_moderated == False)

    if category and category.lower() != "all":
        q = q.filter(CommunityPost.category.ilike(f"%{category.strip()}%"))

    if query:
        pattern = f"%{query.strip()}%"
        q = q.filter(
            (CommunityPost.title.ilike(pattern)) |
            (CommunityPost.content.ilike(pattern))
        )

    total = q.count()
    posts = q.order_by(CommunityPost.is_pinned.desc(), CommunityPost.created_at.desc()).offset((page - 1) * limit).limit(limit).all()

    post_responses: List[CommunityPostResponse] = []
    user_liked_post_ids = set()
    if current_user:
        likes = db.query(PostLike.post_id).filter(PostLike.user_id == current_user.id).all()
        user_liked_post_ids = {l[0] for l in likes}

    for p in posts:
        author_info = CommentAuthor(
            id=p.author.id,
            name=p.author.name,
            role=p.author.role,
            state=p.author.state,
            district=p.author.district
        ) if p.author else None

        post_responses.append(CommunityPostResponse(
            id=p.id,
            user_id=p.user_id,
            title=p.title,
            content=p.content,
            category=p.category,
            likes_count=p.likes_count,
            comments_count=p.comments_count,
            is_pinned=p.is_pinned,
            created_at=p.created_at,
            author=author_info,
            has_liked=p.id in user_liked_post_ids,
            comments=[]
        ))

    return CommunityPostListResponse(
        total=total,
        page=page,
        limit=limit,
        posts=post_responses
    )


@router.post("/posts", response_model=CommunityPostResponse, status_code=status.HTTP_201_CREATED)
def create_post(
    post_in: CommunityPostCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = CommunityPost(
        user_id=current_user.id,
        title=post_in.title.strip(),
        content=post_in.content.strip(),
        category=post_in.category or "General Farming"
    )
    db.add(post)
    db.commit()
    db.refresh(post)

    author_info = CommentAuthor(
        id=current_user.id,
        name=current_user.name,
        role=current_user.role,
        state=current_user.state,
        district=current_user.district
    )

    return CommunityPostResponse(
        id=post.id,
        user_id=post.user_id,
        title=post.title,
        content=post.content,
        category=post.category,
        likes_count=0,
        comments_count=0,
        is_pinned=False,
        created_at=post.created_at,
        author=author_info,
        has_liked=False,
        comments=[]
    )


@router.get("/posts/{post_id}", response_model=CommunityPostResponse)
def get_post_detail(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    has_liked = False
    if current_user:
        like_exists = db.query(PostLike).filter(PostLike.post_id == post_id, PostLike.user_id == current_user.id).first()
        has_liked = bool(like_exists)

    comments_list: List[CommentResponse] = []
    for c in post.comments:
        c_author = CommentAuthor(
            id=c.author.id,
            name=c.author.name,
            role=c.author.role,
            state=c.author.state,
            district=c.author.district
        ) if c.author else None
        comments_list.append(CommentResponse(
            id=c.id,
            post_id=c.post_id,
            user_id=c.user_id,
            content=c.content,
            created_at=c.created_at,
            author=c_author
        ))

    author_info = CommentAuthor(
        id=post.author.id,
        name=post.author.name,
        role=post.author.role,
        state=post.author.state,
        district=post.author.district
    ) if post.author else None

    return CommunityPostResponse(
        id=post.id,
        user_id=post.user_id,
        title=post.title,
        content=post.content,
        category=post.category,
        likes_count=post.likes_count,
        comments_count=len(comments_list),
        is_pinned=post.is_pinned,
        created_at=post.created_at,
        author=author_info,
        has_liked=has_liked,
        comments=comments_list
    )


@router.post("/posts/{post_id}/like")
def toggle_post_like(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    existing_like = db.query(PostLike).filter(
        PostLike.post_id == post_id,
        PostLike.user_id == current_user.id
    ).first()

    if existing_like:
        db.delete(existing_like)
        post.likes_count = max(0, post.likes_count - 1)
        liked = False
    else:
        new_like = PostLike(post_id=post_id, user_id=current_user.id)
        db.add(new_like)
        post.likes_count += 1
        liked = True

    db.commit()
    return {"liked": liked, "likes_count": post.likes_count}


@router.post("/posts/{post_id}/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def add_comment(
    post_id: int,
    comment_in: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    comment = Comment(
        post_id=post_id,
        user_id=current_user.id,
        content=comment_in.content.strip()
    )
    db.add(comment)
    post.comments_count += 1
    db.commit()
    db.refresh(comment)

    c_author = CommentAuthor(
        id=current_user.id,
        name=current_user.name,
        role=current_user.role,
        state=current_user.state,
        district=current_user.district
    )

    return CommentResponse(
        id=comment.id,
        post_id=comment.post_id,
        user_id=comment.user_id,
        content=comment.content,
        created_at=comment.created_at,
        author=c_author
    )


@router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(
    post_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    post = db.query(CommunityPost).filter(CommunityPost.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id and current_user.role != "Admin":
        raise HTTPException(status_code=403, detail="Not authorized to delete this post")
    db.delete(post)
    db.commit()
    return None
