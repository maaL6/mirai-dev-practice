from django.core.management.base import BaseCommand

from apps.crm.models import Stage


class Command(BaseCommand):
    help = 'Seeds default CRM stages'

    def handle(self, *args, **kwargs):
        stages = [
            ("New", 10),
            ("Qualified", 20),
            ("Proposal", 30),
            ("Won", 40),
            ("Lost", 50),
        ]
        
        for name, order in stages:
            Stage.objects.get_or_create(
                name=name,
                defaults={'order': order, 'is_active': True}
            )
            
        self.stdout.write(self.style.SUCCESS("Successfully seeded CRM stages."))
