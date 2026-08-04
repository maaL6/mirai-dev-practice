from django.contrib import admin
from .models import Stage, Opportunity

@admin.register(Stage)
class StageAdmin(admin.ModelAdmin):
    list_display = ('name', 'order', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(Opportunity)
class OpportunityAdmin(admin.ModelAdmin):
    list_display = ('name', 'expected_revenue', 'stage', 'owner', 'created_at')
    list_filter = ('stage', 'owner')
    search_fields = ('name',)
