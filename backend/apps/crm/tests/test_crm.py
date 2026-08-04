from decimal import Decimal

from django.contrib.auth import get_user_model
from django.core.management import call_command
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.crm.models import Opportunity, Stage
from apps.customers.models import Contact, Customer

User = get_user_model()


class StageSeederTests(TestCase):
    """Test that seed_crm command is idempotent."""

    def test_seed_stages_idempotent(self):
        call_command("seed_crm")
        count_1 = Stage.objects.count()
        call_command("seed_crm")
        count_2 = Stage.objects.count()
        self.assertEqual(count_1, count_2)
        self.assertEqual(count_2, 5)

    def test_seed_demo_creates_stages(self):
        """seed_demo should also create stages."""
        call_command("seed_demo")
        self.assertEqual(Stage.objects.count(), 5)
        expected = {"New", "Qualified", "Proposal", "Won", "Lost"}
        actual = set(Stage.objects.values_list("name", flat=True))
        self.assertEqual(actual, expected)


class OpportunityApiTests(TestCase):
    def setUp(self):
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.test",
            password="password123",
            role="admin",
        )
        self.manager = User.objects.create_user(
            username="manager",
            email="manager@example.test",
            password="password123",
            role="manager",
        )
        self.member1 = User.objects.create_user(
            username="minh",
            email="minh@example.test",
            password="password123",
            role="member",
        )
        self.member2 = User.objects.create_user(
            username="outsider",
            email="outsider@example.test",
            password="password123",
            role="member",
        )

        self.customer = Customer.objects.create(
            name="Acme Ltd",
            kind="company",
            email="contact@acme.com",
            owner=self.member1,
        )
        self.contact_acme = Contact.objects.create(
            customer=self.customer,
            name="Linh Nguyen",
            email="linh@acme.com",
        )
        self.other_customer = Customer.objects.create(
            name="Nova Studio",
            kind="company",
            email="hello@nova.com",
            owner=self.member2,
        )
        self.contact_nova = Contact.objects.create(
            customer=self.other_customer,
            name="An Tran",
            email="an@nova.com",
        )

        self.stage_new = Stage.objects.create(name="New", order=10)
        self.stage_won = Stage.objects.create(name="Won", order=40)
        self.stage_lost = Stage.objects.create(name="Lost", order=50)

        self.opp1 = Opportunity.objects.create(
            name="Big Deal",
            expected_revenue=Decimal("100000.00"),
            customer=self.customer,
            contact=self.contact_acme,
            stage=self.stage_new,
            owner=self.member1,
        )

        self.client = APIClient()

    # ------------------------------------------------------------------
    # Contact must belong to Customer
    # ------------------------------------------------------------------

    def test_contact_from_different_customer_rejected(self):
        """Creating an opportunity with a contact not belonging to the customer."""
        self.client.force_authenticate(user=self.member1)
        data = {
            "name": "Cross Customer Deal",
            "expected_revenue": "5000.00",
            "customer": str(self.customer.id),
            "contact": str(self.contact_nova.id),  # belongs to Nova, not Acme!
            "stage": str(self.stage_new.id),
        }
        res = self.client.post("/api/crm/opportunities/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("contact", res.data)

    def test_contact_belonging_to_customer_accepted(self):
        """Creating an opportunity with the correct contact-customer pair."""
        self.client.force_authenticate(user=self.member1)
        data = {
            "name": "Good Deal",
            "expected_revenue": "5000.00",
            "customer": str(self.customer.id),
            "contact": str(self.contact_acme.id),
            "stage": str(self.stage_new.id),
        }
        res = self.client.post("/api/crm/opportunities/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    # ------------------------------------------------------------------
    # Negative expected_revenue rejected
    # ------------------------------------------------------------------

    def test_negative_revenue_rejected(self):
        self.client.force_authenticate(user=self.member1)
        data = {
            "name": "Negative Deal",
            "expected_revenue": "-1000.00",
            "customer": str(self.customer.id),
            "stage": str(self.stage_new.id),
        }
        res = self.client.post("/api/crm/opportunities/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------
    # Member cannot change owner
    # ------------------------------------------------------------------

    def test_member_cannot_assign_to_others(self):
        self.client.force_authenticate(user=self.member1)
        data = {
            "name": "Stolen Deal",
            "expected_revenue": "999.00",
            "customer": str(self.customer.id),
            "stage": str(self.stage_new.id),
            "owner": str(self.member2.id),  # trying to assign to member2
        }
        res = self.client.post("/api/crm/opportunities/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("owner", res.data)

        # Omitted owner automatically defaults to member1
        data_no_owner = {
            "name": "Own Deal",
            "expected_revenue": "999.00",
            "customer": str(self.customer.id),
            "stage": str(self.stage_new.id),
        }
        res_ok = self.client.post("/api/crm/opportunities/", data_no_owner, format="json")
        self.assertEqual(res_ok.status_code, status.HTTP_201_CREATED)
        opp = Opportunity.objects.get(id=res_ok.data["id"])
        self.assertEqual(opp.owner, self.member1)

    # ------------------------------------------------------------------
    # Queryset respects permissions
    # ------------------------------------------------------------------

    def test_member_sees_only_own_opportunities(self):
        self.client.force_authenticate(user=self.member2)
        res = self.client.get("/api/crm/opportunities/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        # member2 has no opportunities
        self.assertEqual(len(results), 0)

    def test_admin_sees_all_opportunities(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/crm/opportunities/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        self.assertEqual(len(results), 1)

    def test_manager_sees_all_opportunities(self):
        """Manager sees all due to temporary team scope rule."""
        self.client.force_authenticate(user=self.manager)
        res = self.client.get("/api/crm/opportunities/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        self.assertEqual(len(results), 1)

    # ------------------------------------------------------------------
    # Cannot transition to Won/Lost via regular PATCH
    # ------------------------------------------------------------------

    def test_cannot_patch_to_won_stage(self):
        self.client.force_authenticate(user=self.member1)
        res = self.client.patch(
            f"/api/crm/opportunities/{self.opp1.id}/",
            {"stage": str(self.stage_won.id)},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_cannot_patch_to_lost_stage(self):
        self.client.force_authenticate(user=self.member1)
        res = self.client.patch(
            f"/api/crm/opportunities/{self.opp1.id}/",
            {"stage": str(self.stage_lost.id)},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    # ------------------------------------------------------------------
    # Owner filter
    # ------------------------------------------------------------------

    def test_filter_by_owner(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get(f"/api/crm/opportunities/?owner={self.member1.id}")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        self.assertEqual(len(results), 1)

        res2 = self.client.get(f"/api/crm/opportunities/?owner={self.member2.id}")
        results2 = res2.data.get("results", res2.data) if isinstance(res2.data, dict) else res2.data
        self.assertEqual(len(results2), 0)
