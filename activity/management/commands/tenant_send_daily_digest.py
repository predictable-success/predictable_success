from tenant_schemas.management.commands import BaseTenantCommand


class Command(BaseTenantCommand):
    COMMAND_NAME = 'send_daily_digest'
