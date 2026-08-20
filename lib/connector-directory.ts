export type ConnectorCategoryId =
  | 'databases'
  | 'warehouses-analytics'
  | 'streaming-messaging'
  | 'files'
  | 'saas-business-commerce-apis'
  | 'custom-development';

export type ConnectorMaturity = 'ga' | 'preview' | 'deprecated';

export type ConnectorDocumentationStatus = 'current' | 'roadmap' | 'unlisted';

export type ConnectorProductProfile = {
  status: Exclude<ConnectorDocumentationStatus, 'unlisted'>;
  displayTitle?: string;
  useAs: Array<'source' | 'target'>;
  modes: string[];
};

export type ConnectorDirectoryItem = {
  slug: string;
  id: string;
  title: string;
  category: ConnectorCategoryId;
  maturity: ConnectorMaturity;
  /** Participates in a published, end-to-end release flow. This is distinct from maturity. */
  releaseTestedE2E?: boolean;
  /** Server registration is authoritative for roles and modes while catalog metadata catches up. */
  capabilityAuthority?: 'server';
  useAs: Array<'source' | 'target'>;
  modes: string[];
};

export const connectorCategories: Array<{
  id: ConnectorCategoryId;
  label: string;
  description: string;
}> = [
  { id: 'databases', label: 'Databases', description: 'Operational, document, key-value, and search systems.' },
  { id: 'warehouses-analytics', label: 'Warehouses & analytics', description: 'Analytical databases, lakehouses, and query engines.' },
  { id: 'streaming-messaging', label: 'Streaming & messaging', description: 'Event brokers and message queues.' },
  { id: 'files', label: 'Files', description: 'Structured file formats and file transports.' },
  { id: 'saas-business-commerce-apis', label: 'SaaS, business & commerce APIs', description: 'Productivity, CRM, and marketplace APIs.' },
  { id: 'custom-development', label: 'Custom & development', description: 'Script-defined integrations and deterministic test data.' },
];

/**
 * Published connector inventory with reader-facing maturity, documented roles,
 * and read modes.
 */
export const connectorDirectory: ConnectorDirectoryItem[] = [
  { slug: 'mysql', id: 'mysql', title: 'MySQL', category: 'databases', maturity: 'ga', releaseTestedE2E: true, useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'postgresql', id: 'postgres', title: 'PostgreSQL', category: 'databases', maturity: 'ga', capabilityAuthority: 'server', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'oracle', id: 'oracle', title: 'Oracle', category: 'databases', maturity: 'ga', capabilityAuthority: 'server', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'sqlserver', id: 'sqlserver', title: 'SQL Server', category: 'databases', maturity: 'ga', capabilityAuthority: 'server', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'mongodb', id: 'mongodb', title: 'MongoDB', category: 'databases', maturity: 'ga', releaseTestedE2E: true, useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'mongodb-atlas', id: 'mongodb-atlas', title: 'MongoDB Atlas', category: 'databases', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'tidb', id: 'tidb', title: 'TiDB', category: 'databases', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'aws-rds-mysql', id: 'aws-rds-mysql', title: 'Amazon RDS for MySQL', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'mongodb3', id: 'mongodb3', title: 'MongoDB 3.4 and earlier', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'polar-db-mysql', id: 'polar-db-mysql', title: 'PolarDB for MySQL', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'polar-db-postgresql', id: 'polar-db-postgres', title: 'PolarDB for PostgreSQL', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'azure-cosmosdb', id: 'azure-cosmosdb', title: 'Azure Cosmos DB', category: 'databases', maturity: 'preview', useAs: ['source'], modes: ['snapshot'] },
  { slug: 'mysql-pxc', id: 'mysql-pxc', title: 'MySQL PXC', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'oceanbase', id: 'oceanbase', title: 'OceanBase', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'opengauss', id: 'open-gauss', title: 'openGauss', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot'] },
  { slug: 'mariadb', id: 'mariadb', title: 'MariaDB', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'tdengine', id: 'tdengine', title: 'TDengine', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'redis', id: 'redis', title: 'Redis', category: 'databases', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'elasticsearch', id: 'elasticsearch', title: 'Elasticsearch', category: 'databases', maturity: 'preview', useAs: ['target'], modes: [] },

  { slug: 'doris', id: 'doris', title: 'Apache Doris', category: 'warehouses-analytics', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot'] },
  { slug: 'clickhouse', id: 'clickhouse', title: 'ClickHouse', category: 'warehouses-analytics', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot'] },
  { slug: 'aws-clickhouse', id: 'aws-clickhouse', title: 'ClickHouse Cloud on AWS', category: 'warehouses-analytics', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot'] },
  { slug: 'selectdb', id: 'selectdb', title: 'SelectDB', category: 'warehouses-analytics', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot'] },
  { slug: 'snowflake', id: 'snowflake', title: 'Snowflake', category: 'warehouses-analytics', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot'] },
  { slug: 'bigquery', id: 'bigquery', title: 'BigQuery', category: 'warehouses-analytics', maturity: 'preview', useAs: ['target'], modes: [] },
  { slug: 'databend', id: 'databend', title: 'Databend', category: 'warehouses-analytics', maturity: 'preview', useAs: ['target'], modes: [] },
  { slug: 'greenplum', id: 'greenplum', title: 'Greenplum', category: 'warehouses-analytics', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot'] },
  { slug: 'hudi', id: 'hudi', title: 'Apache Hudi', category: 'warehouses-analytics', maturity: 'preview', useAs: ['target'], modes: [] },
  { slug: 'paimon', id: 'paimon', title: 'Apache Paimon', category: 'warehouses-analytics', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'starrocks', id: 'starrocks', title: 'StarRocks', category: 'warehouses-analytics', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot'] },

  { slug: 'kafka', id: 'kafka_enhanced', title: 'Kafka', category: 'streaming-messaging', maturity: 'ga', useAs: ['source', 'target'], modes: ['stream'] },
  { slug: 'activemq', id: 'activemq', title: 'Apache ActiveMQ', category: 'streaming-messaging', maturity: 'preview', useAs: ['source', 'target'], modes: ['stream'] },
  { slug: 'rabbitmq', id: 'rabbitmq', title: 'RabbitMQ', category: 'streaming-messaging', maturity: 'preview', useAs: ['source', 'target'], modes: ['stream'] },
  { slug: 'rocketmq', id: 'rocketmq', title: 'Apache RocketMQ', category: 'streaming-messaging', maturity: 'preview', useAs: ['source', 'target'], modes: ['stream'] },

  { slug: 'csv', id: 'csv', title: 'CSV', category: 'files', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'json', id: 'json', title: 'JSON', category: 'files', maturity: 'preview', useAs: ['source'], modes: ['snapshot', 'cdc'] },
  { slug: 'excel', id: 'excel', title: 'Excel', category: 'files', maturity: 'preview', useAs: ['source'], modes: ['snapshot', 'cdc'] },
  { slug: 'xml', id: 'xml', title: 'XML', category: 'files', maturity: 'preview', useAs: ['source'], modes: ['snapshot', 'cdc'] },

  { slug: 'github', id: 'GitHub', title: 'GitHub', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['api'] },
  { slug: 'quickapi', id: 'quickapi', title: 'QuickAPI', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['snapshot'] },
  { slug: 'hubspot', id: 'hubspot', title: 'HubSpot', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['api'] },
  { slug: 'metabase', id: 'metabase', title: 'Metabase', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['api'] },
  { slug: 'salesforce', id: 'salesforce', title: 'Salesforce', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['api'] },
  { slug: 'zoho-crm', id: 'zoho-crm', title: 'Zoho CRM', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['api'] },
  { slug: 'zoho-desk', id: 'zoho-desk', title: 'Zoho Desk', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['snapshot'] },
  { slug: 'http-receiver', id: 'http-receiver', title: 'HTTP Receiver', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['source'], modes: ['snapshot'] },
  { slug: 'vika', id: 'vika', title: 'Vika', category: 'saas-business-commerce-apis', maturity: 'preview', useAs: ['target'], modes: [] },

  { slug: 'custom', id: 'custom', title: 'Custom Connection', category: 'custom-development', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'dummy', id: 'dummy', title: 'Dummy', category: 'custom-development', maturity: 'preview', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
];

/**
 * Product-facing connector exposure. This is deliberately separate from
 * connector maturity and catalog metadata: it describes what the current
 * tapstate docs directory publishes, not everything for which preparation
 * material exists.
 */
export const connectorProductProfiles: Record<string, ConnectorProductProfile> = {
  mysql: { status: 'current', useAs: ['source'], modes: ['snapshot', 'cdc'] },
  mongodb: { status: 'current', useAs: ['target'], modes: [] },
  postgresql: { status: 'roadmap', useAs: ['source'], modes: ['snapshot', 'cdc'] },
  kafka: { status: 'roadmap', displayTitle: 'Kafka / Confluent', useAs: ['target'], modes: [] },
};

export function getConnectorDocumentationStatus(slug: string): ConnectorDocumentationStatus {
  return connectorProductProfiles[slug]?.status ?? 'unlisted';
}

export function getConnectorsByDocumentationStatus(
  status: Exclude<ConnectorDocumentationStatus, 'unlisted'>,
) {
  return connectorDirectory.filter(
    (connector) => connectorProductProfiles[connector.slug]?.status === status,
  );
}

export function getConnectorProductProfile(slug: string) {
  return connectorProductProfiles[slug];
}

export function getConnectorsByCategory(category: ConnectorCategoryId) {
  return connectorDirectory.filter((connector) => connector.category === category);
}

export function connectorMaturityCounts(connectors = connectorDirectory) {
  return connectors.reduce(
    (counts, connector) => {
      counts[connector.maturity] += 1;
      return counts;
    },
    { ga: 0, preview: 0, deprecated: 0 },
  );
}

export function connectorReleaseTestedCount(connectors = connectorDirectory) {
  return connectors.filter((connector) => connector.releaseTestedE2E).length;
}

export function connectorMaturityLabel(maturity: ConnectorMaturity) {
  return maturity === 'ga'
    ? 'GA'
    : maturity === 'preview'
      ? 'Preview'
      : 'Deprecated';
}

export function renderConnectorDirectoryForLLM() {
  const renderRows = (status: 'current' | 'roadmap') => getConnectorsByDocumentationStatus(status)
    .map((connector) => {
      const profile = connectorProductProfiles[connector.slug];
      const roles = profile.useAs.map((role) => role[0].toUpperCase() + role.slice(1)).join(' + ') || '—';
      const modes = profile.modes.join(', ') || '—';
      const releaseTested = connector.releaseTestedE2E ? 'E2E' : '—';
      const title = profile.displayTitle ?? connector.title;
      return `| [${title}](/docs/connectors/${connector.slug}) | ${connectorMaturityLabel(connector.maturity)} | ${releaseTested} | ${roles} | ${modes} |`;
    })
    .join('\n');

  return `## Current connector path

The current product directory publishes the connector roles used by the MySQL-to-MongoDB operational-state path.

| Connector | Guide maturity | E2E | Published role | Read modes |
|---|---|---|---|---|
${renderRows('current')}

## Roadmap

These guides describe planned directions, not current product contracts. No release date is implied.

| Connector | Guide maturity | E2E | Planned role | Planned read modes |
|---|---|---|---|---|
${renderRows('roadmap')}`;
}
