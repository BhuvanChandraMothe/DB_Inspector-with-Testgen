from typing import Optional, List
from uuid import UUID
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    BigInteger,
    LargeBinary,
    Boolean,
    Float,
    ForeignKey,
    Identity,
    func
)
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Session
import logging

# Logging config
logging.basicConfig(level=logging.INFO)
LOG = logging.getLogger(__name__)

SQLALCHEMY_DATABASE_URL = "postgresql://postgres:bhuvan@localhost:5432/postgres"

engine = create_engine(SQLALCHEMY_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Connection(Base):
    __tablename__ = "connections"
    __table_args__ = {'schema': 'tgapp'}

    id = Column(PG_UUID, default=func.gen_random_uuid())
    project_code = Column(String(30), nullable=True)
    connection_id = Column(BigInteger, Identity(always=True), primary_key=True)
    sql_flavor = Column('sql_flavor', String(30))
    project_host = Column(String(250))
    project_port = Column(String(5))
    project_user = Column(String(50))
    project_db = Column(String(100))
    connection_name = Column(String(40))
    # Added the missing connection_description column
    connection_description = Column(String(1000), nullable=True)
    project_pw_encrypted = Column(LargeBinary, nullable=True)
    max_threads = Column(Integer, default=4)
    max_query_chars = Column(Integer, nullable=True)
    url = Column(String(200), default='')
    connect_by_url = Column(Boolean, default=False)
    connect_by_key = Column(Boolean, default=False)
    private_key = Column(LargeBinary, nullable=True)
    private_key_passphrase = Column(LargeBinary, nullable=True)
    http_path = Column(String(200), nullable=True)


class TableGroupModel(Base):
    __tablename__ = "table_groups"
    __table_args__ = {'schema': 'tgapp'}

    id = Column(PG_UUID, primary_key=True, default=func.gen_random_uuid())
    project_code = Column(String(30), nullable=True)
    connection_id = Column(BigInteger, ForeignKey('tgapp.connections.connection_id'), nullable=True)
    name = Column('table_groups_name', String(100))
    db_schema = Column('table_group_schema', String(100))
    explicit_table_list = Column('profiling_table_set', String(2000), nullable=True)
    tables_to_include_mask = Column('profiling_include_mask', String(2000), nullable=True)
    profiling_exclude_mask = Column('profiling_exclude_mask', String(2000), nullable=True)
    profiling_id_column_mask = Column('profile_id_column_mask', String(2000), default='%id', nullable=True)
    profiling_surrogate_key_column_mask = Column('profile_sk_column_mask', String(150), default='%_sk', nullable=True)
    profile_use_sampling = Column(String(3), default='N', nullable=True)
    profile_sample_percent = Column(String(3), default='30', nullable=True)
    profile_sample_min_count = Column(BigInteger, default=100000, nullable=True)
    min_profiling_age_days = Column('profiling_delay_days', String(3), default='0', nullable=True)
    profile_flag_cdes = Column(Boolean, default=True, nullable=True)
    profile_do_pair_rules = Column(String(3), default='N', nullable=True)
    profile_pair_rule_pct = Column(Integer, default=95, nullable=True)
    description = Column(String(1000), nullable=True)
    data_source = Column(String(40), nullable=True)
    source_system = Column(String(40), nullable=True)
    source_process = Column(String(40), nullable=True)
    data_location = Column(String(40), nullable=True)
    business_domain = Column(String(40), nullable=True)
    stakeholder_group = Column(String(40), nullable=True)
    transform_level = Column(String(40), nullable=True)
    data_product = Column(String(40), nullable=True)
    last_complete_profile_run_id = Column(PG_UUID, nullable=True)
    dq_score_profiling = Column(Float, nullable=True)
    dq_score_testing = Column(Float, nullable=True)


def create_tables():
    # This function is for initial database setup.
    # If your schema 'tgapp' and tables already exist with data,
    # you should not run Base.metadata.create_all().
    print("Skipping table creation as schema 'tgapp' and tables are assumed to exist.")
    # Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_connection(db: Session, connection: dict) -> int:
    db_connection = Connection(**connection)
    db.add(db_connection)
    db.commit()
    db.refresh(db_connection)
    return db_connection.connection_id

def get_all_connections(db: Session) -> List[Connection]:
    return db.query(Connection).all()

def get_connection(db: Session, connection_id: int) -> Optional[Connection]:
    return db.query(Connection).filter(Connection.connection_id == connection_id).first()


def update_connection(db: Session, connection_id: int, updated_data: dict) -> bool:
    db_connection = db.query(Connection).filter(Connection.connection_id == connection_id).first()
    if db_connection:
        for key, value in updated_data.items():
            if hasattr(db_connection, key):
                 setattr(db_connection, key, value)
            else:
                 LOG.warning(f"Attempted to update non-existent attribute: {key}")
        db.commit()
        db.refresh(db_connection)
        return True
    return False

def delete_connection(db: Session, connection_id: int) -> bool:
    db_connection = db.query(Connection).filter(Connection.connection_id == connection_id).first()
    if db_connection:
        db.delete(db_connection)
        db.commit()
        return True
    return False
