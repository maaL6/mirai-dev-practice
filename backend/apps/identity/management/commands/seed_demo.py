from django.core.management.base import BaseCommand

from apps.identity.models import User

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
        "email": "member@example.test",
        "username": "member",
        "first_name": "Team",
        "last_name": "Member",
        "role": User.Role.MEMBER,
    },
]

# Password is intentionally NOT logged.
_DEMO_PASSWORD = "local-demo-password"


class Command(BaseCommand):
    help = "Seed demo users (idempotent — safe to run multiple times)."

    def handle(self, *args, **options):
        created_count = 0
        for data in DEMO_USERS:
            email = data["email"]
            user, created = User.objects.get_or_create(
                email=email,
                defaults=data,
            )
            if created:
                user.set_password(_DEMO_PASSWORD)
                user.save(update_fields=["password"])
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f"  Created {email} ({data['role']})"))
            else:
                # Update staff / superuser status if already exists
                updated = False
                for field in ["is_staff", "is_superuser", "role"]:
                    if field in data and getattr(user, field) != data[field]:
                        setattr(user, field, data[field])
                        updated = True
                if updated:
                    user.save()
                    self.stdout.write(self.style.SUCCESS(f"  Updated {email} ({data['role']})"))
                else:
                    self.stdout.write(f"  Exists  {email} — skipped")

        self.stdout.write(
            self.style.SUCCESS(
                f"\nDone. {created_count} user(s) created, "
                f"{len(DEMO_USERS) - created_count} already existed."
            )
        )
