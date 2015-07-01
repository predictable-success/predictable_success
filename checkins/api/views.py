from django.utils.decorators import method_decorator
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status, generics
from org.models import Employee
from org.decorators import add_current_employee_id_to_request
from ..models import CheckIn
from .serializers import CheckInSerializer, CreateCheckInSerializer


class EmployeeCheckInList(generics.ListAPIView):
    serializer_class = CheckInSerializer

    def get_queryset(self):
        employee_id = self.kwargs['employee_id']
        return CheckIn.objects.filter(employee_id=employee_id)


class HostCheckInList(generics.ListAPIView):
    serializer_class = CheckInSerializer

    def get_queryset(self):
        host = self.request.user.employee
        return CheckIn.objects.filter(host=host)


class CheckInDetail(APIView):
    def get(self, request, pk, paginator=None):
        try:
            employee = Employee.objects.get(id=pk)
            checkins = CheckIn.objects.filter(employee=employee)
            if paginator:
                checkins = paginator.paginate_queryset(checkins, request)
            serializer = CheckInSerializer(checkins, many=True, context={'request': request})
            return paginator.get_paginated_response(serializer.data)
        except Employee.DoesNotExist:
            return Response(None, status=status.HTTP_404_NOT_FOUND)

    @method_decorator(add_current_employee_id_to_request('host'))
    def post(self, request):
        serializer = CreateCheckInSerializer(data=request.DATA)

        if serializer.is_valid():
            checkin = serializer.save()
            serializer = CheckInSerializer(checkin)
            return Response(serializer.data)
        else:
            return Response(serializer.errors, status=400)



