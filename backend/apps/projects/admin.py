from django.contrib import admin

from .models import Project, Task


class TaskInline(admin.TabularInline):
    model = Task
    extra = 1


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ["name", "customer", "manager", "status", "start_date", "due_date", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "description"]
    inlines = [TaskInline]


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ["title", "project", "assignee", "status", "due_date", "completed_at"]
    list_filter = ["status"]
    search_fields = ["title", "description"]
