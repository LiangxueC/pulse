from sqlalchemy import Column, String, Float, Integer, Boolean, Text, ForeignKey
from db import Base


class Company(Base):
    __tablename__ = "companies"
    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    user = Column(String, nullable=False)


class CashFlowConfig(Base):
    __tablename__ = "cash_flow_config"
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(String, ForeignKey("companies.id"))
    projected_lowest_balance = Column(Float, nullable=False)
    target_minimum_buffer = Column(Float, nullable=False)
    safe_zone_threshold = Column(Float, nullable=False)


class CashFlowProjection(Base):
    __tablename__ = "cash_flow_projection"
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(String, ForeignKey("companies.id"))
    day = Column(Integer, nullable=False)
    balance = Column(Float, nullable=False)


class Invoice(Base):
    __tablename__ = "invoices"
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    company = Column(String, nullable=False)
    days_overdue = Column(Integer, default=0)
    amount = Column(Float, nullable=False)
    status = Column(String, default="overdue")


class Bill(Base):
    __tablename__ = "bills"
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    name = Column(String, nullable=False)
    due_date = Column(String, nullable=False)
    due_date_label = Column(String, nullable=False)
    amount = Column(Float, nullable=False)


class Subscription(Base):
    __tablename__ = "subscription_ranking"
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    name = Column(String, nullable=False)
    recommended = Column(Boolean, default=False)


class CashRedirect(Base):
    __tablename__ = "cash_redirects"
    id = Column(String, primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    text = Column(Text, nullable=False)


class RedirectImpact(Base):
    __tablename__ = "redirect_impacts"
    redirect_id = Column(String, ForeignKey("cash_redirects.id"), primary_key=True)
    company_id = Column(String, ForeignKey("companies.id"))
    description = Column(Text, nullable=False)
    monthly_saving = Column(Float, nullable=False)
    balance_increase = Column(Float, nullable=False)


class ArchivedCase(Base):
    __tablename__ = "archived_cases"
    id = Column(Integer, primary_key=True, autoincrement=True)
    company_id = Column(String, ForeignKey("companies.id"))
    date = Column(String, nullable=False)
    label = Column(String, nullable=False)
