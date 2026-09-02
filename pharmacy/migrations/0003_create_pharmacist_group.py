from django.db import migrations


def create_pharmacist_group(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')

    Group.objects.get_or_create(
        name='Pharmacist'
    )


class Migration(migrations.Migration):

    dependencies = [
        ('pharmacy', '0002_medicinebill_prescription'),
    ]

    operations = [
        migrations.RunPython(create_pharmacist_group),
    ]