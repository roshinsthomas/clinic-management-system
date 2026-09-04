from django.urls import path
from .views import (DepartmentListCreateView, DepartmentDetailView, StaffListCreateView,StaffDetailView,DoctorListView,DoctorDetailView,LoginView,MedicineListView,
    MedicineDetailView,LabTestListCreateView,
    LabTestDetailView,)

urlpatterns = [
    path('departments/', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(),name='department-detail'),
    path('staff/',StaffListCreateView.as_view(),name='staff-list-create'),
    path('staff/<int:pk>/',StaffDetailView.as_view(),name='staff-detail'),
    path('doctors/',DoctorListView.as_view(),name='doctor-list'),
    path('doctors/<int:pk>/',DoctorDetailView.as_view(),name='doctor-detail'),
    path('login/',LoginView.as_view(),name='login'),
    path('medicines/', MedicineListView.as_view(), name='medicine-list'),
    path('medicines/<int:pk>/',MedicineDetailView.as_view(),name='medicine-detail' ),
    path('lab-tests/',LabTestListCreateView.as_view(),name="lab-test-list"),
    path('lab-tests/<int:pk>/', LabTestDetailView.as_view(), name="lab-test-detail"),
]