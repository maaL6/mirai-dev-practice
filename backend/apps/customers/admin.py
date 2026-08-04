from django.contrib import admin

from .models import Contact, Customer


class ContactInline(admin.TabularInline):
    model = Contact
    extra = 1


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["name", "kind", "email", "phone", "owner", "is_active", "created_at"]
    list_filter = ["kind", "is_active"]
    search_fields = ["name", "email", "phone"]
    inlines = [ContactInline]


@admin.register(Contact)
class ContactAdmin(admin.ModelAdmin):
    list_display = ["name", "customer", "job_title", "email", "phone", "is_primary"]
    list_filter = ["is_primary"]
    search_fields = ["name", "email", "phone"]
