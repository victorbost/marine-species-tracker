from django.urls import path

from .views import (
    CuratedObservationListView,
    ObservationDetailView,
    ObservationExportView,
    ObservationListCreateView,
    ObservationValidateView,
)

urlpatterns = [
    path("", ObservationListCreateView.as_view(), name="user-observations"),
    path(
        "<int:pk>/", ObservationDetailView.as_view(), name="observation-detail"
    ),
    path(
        "export/", ObservationExportView.as_view(), name="observation-export"
    ),
    path(
        "<int:pk>/validate/",
        ObservationValidateView.as_view(),
        name="observation-validate",
    ),
    path(
        "curated/",
        CuratedObservationListView.as_view(),
        name="curated-observations",
    ),
]
