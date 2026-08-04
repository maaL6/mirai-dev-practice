from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.customers.models import Contact, Customer

User = get_user_model()


class CustomerApiTests(TestCase):
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
            username="lan",
            email="lan@example.test",
            password="password123",
            role="member",
        )

        self.customer1 = Customer.objects.create(
            name="Acme Ltd",
            kind="company",
            email="contact@acme.com",
            phone="123456789",
            owner=self.member1,
        )

        self.customer2 = Customer.objects.create(
            name="Nova Studio",
            kind="company",
            email="hello@nova.com",
            phone="987654321",
            owner=self.member2,
        )

        self.contact1 = Contact.objects.create(
            customer=self.customer1,
            name="Linh Nguyen",
            job_title="CEO",
            email="linh@acme.com",
            phone="090111222",
            is_primary=True,
        )

        self.client = APIClient()

    def test_member_create_customer_auto_assigns_owner(self):
        self.client.force_authenticate(user=self.member1)
        data = {
            "name": "Global Tech",
            "kind": "company",
            "email": "info@globaltech.com",
            "owner": str(self.member2.id),  # Attempting to assign to member2
        }
        res = self.client.post("/api/customers/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["name"], "Global Tech")
        # Owner MUST be member1 (current user)
        customer = Customer.objects.get(id=res.data["id"])
        self.assertEqual(customer.owner, self.member1)

    def test_member_see_only_own_customers(self):
        self.client.force_authenticate(user=self.member1)
        res = self.client.get("/api/customers/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        # Should return list with customer1 only (not customer2)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        customer_ids = [c["id"] for c in results]
        self.assertIn(str(self.customer1.id), customer_ids)
        self.assertNotIn(str(self.customer2.id), customer_ids)

    def test_manager_and_admin_see_all_customers(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/customers/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        self.assertEqual(len(results), 2)

    def test_customer_search_by_contact_name(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.get("/api/customers/?search=Linh")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data.get("results", res.data) if isinstance(res.data, dict) else res.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["name"], "Acme Ltd")

    def test_deactivate_customer(self):
        self.client.force_authenticate(user=self.member1)
        res = self.client.post(f"/api/customers/{self.customer1.id}/deactivate/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.customer1.refresh_from_db()
        self.assertFalse(self.customer1.is_active)

    def test_contact_primary_constraint(self):
        self.client.force_authenticate(user=self.member1)
        contact2 = Contact.objects.create(
            customer=self.customer1,
            name="An Tran",
            job_title="CTO",
            email="an@acme.com",
            is_primary=True,
        )
        self.contact1.refresh_from_db()
        # Setting contact2 as primary must unset primary on contact1
        self.assertTrue(contact2.is_primary)
        self.assertFalse(self.contact1.is_primary)
