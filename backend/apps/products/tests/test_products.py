from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.products.models import Product

User = get_user_model()


class ProductApiTests(TestCase):
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
        self.member = User.objects.create_user(
            username="member",
            email="member@example.test",
            password="password123",
            role="member",
        )

        self.product1 = Product.objects.create(
            sku="SRV-001",
            name="Implementation",
            description="Initial setup service",
            unit_price=Decimal("1500.00"),
        )

        self.client = APIClient()

    def test_sku_uppercase_conversion(self):
        self.client.force_authenticate(user=self.manager)
        data = {
            "sku": "sup-001",
            "name": "Support Package",
            "unit_price": "500.00",
        }
        res = self.client.post("/api/products/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["sku"], "SUP-001")

    def test_duplicate_sku_case_insensitive_rejected(self):
        self.client.force_authenticate(user=self.manager)
        data = {
            "sku": "srv-001",  # Same as SRV-001
            "name": "Duplicate Service",
            "unit_price": "100.00",
        }
        res = self.client.post("/api/products/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("sku", res.data)

    def test_negative_price_rejected(self):
        self.client.force_authenticate(user=self.manager)
        data = {
            "sku": "SRV-002",
            "name": "Discount Service",
            "unit_price": "-50.00",
        }
        res = self.client.post("/api/products/", data, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_member_read_only_access(self):
        self.client.force_authenticate(user=self.member)
        # GET should succeed
        res = self.client.get("/api/products/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        # POST should be forbidden (403)
        data = {
            "sku": "NEW-001",
            "name": "Forbidden Product",
            "unit_price": "100.00",
        }
        res_post = self.client.post("/api/products/", data, format="json")
        self.assertEqual(res_post.status_code, status.HTTP_403_FORBIDDEN)

        # Deactivate should be forbidden (403)
        res_deact = self.client.post(f"/api/products/{self.product1.id}/deactivate/")
        self.assertEqual(res_deact.status_code, status.HTTP_403_FORBIDDEN)

    def test_deactivate_keeps_record(self):
        self.client.force_authenticate(user=self.admin)
        res = self.client.post(f"/api/products/{self.product1.id}/deactivate/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.product1.refresh_from_db()
        self.assertFalse(self.product1.is_active)
        self.assertEqual(Product.objects.count(), 1)

    def test_search_product(self):
        self.client.force_authenticate(user=self.member)
        res = self.client.get("/api/products/?search=Implementation")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        results = res.data["results"] if isinstance(res.data, dict) and "results" in res.data else res.data
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]["sku"], "SRV-001")
