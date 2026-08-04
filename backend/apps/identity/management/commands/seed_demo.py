import datetime
from decimal import Decimal

from django.core.management.base import BaseCommand

from apps.crm.models import Stage
from apps.customers.models import Contact, Customer
from apps.identity.models import User
from apps.products.models import Product
from apps.projects.models import Project, Task

DEMO_USERS = [
    {
        "email": "admin@example.test",
        "username": "admin",
        "first_name": "System",
        "last_name": "Admin",
        "role": User.Role.ADMIN,
        "is_staff": True,
        "is_superuser": True,
    },
    {
        "email": "manager@example.test",
        "username": "manager",
        "first_name": "Project",
        "last_name": "Manager",
        "role": User.Role.MANAGER,
    },
    {
        "email": "minh@example.test",
        "username": "minh",
        "first_name": "Minh",
        "last_name": "Nguyen",
        "role": User.Role.MEMBER,
    },
    {
        "email": "lan@example.test",
        "username": "lan",
        "first_name": "Lan",
        "last_name": "Tran",
        "role": User.Role.MEMBER,
    },
    {
        "email": "outsider@example.test",
        "username": "outsider",
        "first_name": "Outsider",
        "last_name": "User",
        "role": User.Role.MEMBER,
    },
]

_DEMO_PASSWORD = "local-demo-password"


class Command(BaseCommand):
    help = (
        "Seed demo users, customers, products, projects, and tasks "
        "(idempotent — safe to run multiple times)."
    )

    def handle(self, *args, **options):
        # ------------------------------------------------------------------
        # CRM Stages
        # ------------------------------------------------------------------
        stages = [
            ("New", 10),
            ("Qualified", 20),
            ("Proposal", 30),
            ("Won", 40),
            ("Lost", 50),
        ]
        for name, order in stages:
            _, created = Stage.objects.get_or_create(
                name=name,
                defaults={"order": order, "is_active": True},
            )
            if created:
                self.stdout.write(self.style.SUCCESS(f"  Created Stage: {name}"))

        # ------------------------------------------------------------------
        # Users
        # ------------------------------------------------------------------
        users = {}
        for data in DEMO_USERS:
            email = data["email"]
            user, created = User.objects.get_or_create(
                email=email,
                defaults=data,
            )
            if created:
                user.set_password(_DEMO_PASSWORD)
                user.save(update_fields=["password"])
                self.stdout.write(self.style.SUCCESS(f"  Created User: {email} ({data['role']})"))
            users[email] = user

        minh = users["minh@example.test"]
        manager = users["manager@example.test"]
        lan = users["lan@example.test"]

        # Customers & Contacts
        acme, created_acme = Customer.objects.get_or_create(
            name="Acme Ltd",
            defaults={
                "kind": "company",
                "email": "contact@acme.com",
                "phone": "02812345678",
                "owner": minh,
                "is_active": True,
            },
        )
        if created_acme:
            self.stdout.write(self.style.SUCCESS("  Created Customer: Acme Ltd"))

        Contact.objects.get_or_create(
            customer=acme,
            email="linh@acme.com",
            defaults={
                "name": "Linh Nguyen",
                "job_title": "CEO",
                "phone": "0901112223",
                "is_primary": True,
            },
        )

        nova, created_nova = Customer.objects.get_or_create(
            name="Nova Studio",
            defaults={
                "kind": "company",
                "email": "hello@novastudio.com",
                "phone": "02898765432",
                "owner": minh,
                "is_active": True,
            },
        )
        if created_nova:
            self.stdout.write(self.style.SUCCESS("  Created Customer: Nova Studio"))

        Contact.objects.get_or_create(
            customer=nova,
            email="an@novastudio.com",
            defaults={
                "name": "An Tran",
                "job_title": "Design Lead",
                "phone": "0903334445",
                "is_primary": True,
            },
        )

        # Products
        Product.objects.get_or_create(
            sku="SRV-001",
            defaults={
                "name": "SRV-001 Implementation",
                "description": "Enterprise implementation service",
                "unit_price": Decimal("15000000.00"),
                "is_active": True,
            },
        )

        Product.objects.get_or_create(
            sku="SUP-001",
            defaults={
                "name": "SUP-001 Support",
                "description": "Annual technical support package",
                "unit_price": Decimal("5000000.00"),
                "is_active": True,
            },
        )

        # Projects & Tasks
        project, created_proj = Project.objects.get_or_create(
            name="Mirai ERP Rollout",
            customer=acme,
            manager=manager,
            defaults={
                "start_date": datetime.date(2026, 8, 1),
                "due_date": datetime.date(2026, 8, 31),
                "status": "in_progress",
                "description": "Mirai Mini ERP implementation for Acme Ltd",
            },
        )
        if created_proj:
            self.stdout.write(self.style.SUCCESS("  Created Project: Mirai ERP Rollout"))

        Task.objects.get_or_create(
            project=project,
            title="Setup database and environment",
            defaults={
                "assignee": lan,
                "status": "in_progress",
                "due_date": datetime.date(2026, 8, 15),
                "description": "Initial environment provisioning for Lan",
            },
        )

        self.stdout.write(self.style.SUCCESS("\nDemo seed completed successfully."))
