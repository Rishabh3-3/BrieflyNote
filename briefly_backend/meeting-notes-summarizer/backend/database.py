from sqlmodel import SQLModel, create_engine, Session

DATABASE_URL = "sqlite:///./app.db"  # Change to postgres URL later

engine = create_engine(DATABASE_URL, echo=True)  # echo=True logs queries

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session