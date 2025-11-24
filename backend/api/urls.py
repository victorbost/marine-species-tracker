from django.urls import include, path, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions
from rest_framework.routers import DefaultRouter

router = DefaultRouter()

schema_view = get_schema_view(
    openapi.Info(
        title="Marine Species Tracker API",
        default_version="v1",
        description="API documentation for the project",
    ),
    public=True,
    permission_classes=[permissions.IsAdminUser],
)

urlpatterns = [
    path("auth/", include("users.urls")),
    path("observations/", include("observations.urls")),
    path("species/", include("species.urls")),
    path("map/", include("map.urls")),
    re_path(
        r"^v1/docs(?P<format>\.json|\.yaml)$",
        schema_view.without_ui(cache_timeout=0),
        name="schema-json",
    ),
    path(
        "docs/",
        schema_view.with_ui("swagger", cache_timeout=0),
        name="schema-swagger-ui",
    ),
    path(
        "redoc/",
        schema_view.with_ui("redoc", cache_timeout=0),
        name="schema-redoc",
    ),
]
