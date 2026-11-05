from sqlalchemy import inspect, text
from sqlalchemy.engine import Engine


def ensure_delivery_order_columns(engine: Engine) -> None:
    inspector = inspect(engine)
    if "delivery_orders" in inspector.get_table_names():
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

    if "support_requests" in inspector.get_table_names():
        existing_sr = {col["name"] for col in inspector.get_columns("support_requests")}
        new_sr_cols = {
            "image_url": "VARCHAR(255)",
            "consultation_code": "VARCHAR(50)",
            "suspected_disease": "VARCHAR(200)",
            "treatment": "TEXT",
            "preventive_measures": "TEXT",
        }
        with engine.begin() as conn:
            for col, typedef in new_sr_cols.items():
                if col not in existing_sr:
                    conn.execute(text(f"ALTER TABLE support_requests ADD COLUMN {col} {typedef}"))


