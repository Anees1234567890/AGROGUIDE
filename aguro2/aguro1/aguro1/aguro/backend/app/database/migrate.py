from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def ensure_delivery_order_columns(engine: Engine) -> None:
    inspector = inspect(engine)
    if "delivery_orders" not in inspector.get_table_names():
        return

    existing = {col["name"] for col in inspector.get_columns("delivery_orders")}
    new_columns = {
        "delivery_partner": "VARCHAR(150) DEFAULT 'AgroExpress Logistics Hub'",
        "partner_rating": "FLOAT DEFAULT 4.9",
        "estimated_delivery_time": "VARCHAR(100)",
        "payment_status": "VARCHAR(50) DEFAULT 'Pending Payment'",
        "payment_method": "VARCHAR(50)",
        "payment_id": "VARCHAR(50)",
    }

    with engine.begin() as conn:
        for col, typedef in new_columns.items():
            if col not in existing:
                conn.execute(text(f"ALTER TABLE delivery_orders ADD COLUMN {col} {typedef}"))
