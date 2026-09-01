from django.urls import path
from .views import (DepartmentListCreateView, DepartmentDetailView, StaffListCreateView,StaffDetailView,DoctorListView,DoctorDetailView,LoginView)

urlpatterns = [
    path('departments/', DepartmentListCreateView.as_view(), name='department-list-create'),
    path('departments/<int:pk>/', DepartmentDetailView.as_view(),name='department-detail'),
    path('staff/',StaffListCreateView.as_view(),name='staff-list-create'),
    path('staff/<int:pk>/',StaffDetailView.as_view(),name='staff-detail'),
    path('doctors/',DoctorListView.as_view(),name='doctor-list'),
    path('doctors/<int:pk>/',DoctorDetailView.as_view(),name='doctor-detail'),
    path('login/',LoginView.as_view(),name='login'),
]