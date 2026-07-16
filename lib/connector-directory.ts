export type ConnectorCategoryId =
  | 'databases'
  | 'warehouses-analytics'
  | 'streaming-messaging'
  | 'files'
  | 'saas-business-commerce-apis'
  | 'custom-development';

export type ConnectorMaturity = 'ga' | 'preview' | 'deprecated';

export type ConnectorDirectoryItem = {
  slug: string;
  id: string;
  title: string;
  category: ConnectorCategoryId;
  maturity: ConnectorMaturity;
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
 * The published connector inventory. Keep this list aligned with the connector
 * frontmatter; it drives sidebar groups and the reader-facing support matrix.
 */
export const connectorDirectory: ConnectorDirectoryItem[] = [
  { slug: 'mysql', id: 'mysql', title: 'MySQL', category: 'databases', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'postgresql', id: 'postgres', title: 'PostgreSQL', category: 'databases', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'oracle', id: 'oracle', title: 'Oracle', category: 'databases', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'sqlserver', id: 'sqlserver', title: 'SQL Server', category: 'databases', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
  { slug: 'mongodb', id: 'mongodb', title: 'MongoDB', category: 'databases', maturity: 'ga', useAs: ['source', 'target'], modes: ['snapshot', 'cdc'] },
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

export function getConnectorsByCategory(category: ConnectorCategoryId) {
  return connectorDirectory.filter((connector) => connector.category === category);
}

export function connectorMaturityCounts() {
  return connectorDirectory.reduce(
    (counts, connector) => {
      counts[connector.maturity] += 1;
      return counts;
    },
    { ga: 0, preview: 0, deprecated: 0 },
  );
}

export function renderSupportedConnectorMatrixForLLM() {
  const active = connectorCategories
    .map((category) => {
      const rows = getConnectorsByCategory(category.id)
        .filter((connector) => connector.maturity !== 'deprecated')
        .map((connector) => {
          const roles = connector.useAs.length > 0
            ? connector.useAs.map((role) => role[0].toUpperCase() + role.slice(1)).join(' + ')
            : 'Not declared';
          const modes = connector.modes.length > 0
            ? connector.modes.join(', ')
            : connector.useAs.includes('source')
              ? 'Not declared'
              : connector.useAs.includes('target')
                ? 'Target only'
                : 'Not declared';
          return `| [${connector.title}](/docs/connectors/${connector.slug}) | ${connector.maturity.toUpperCase()} | ${roles} | ${modes} |`;
        })
        .join('\n');

      return `## ${category.label}\n\n${category.description}\n\n| Connector | Maturity | Works as | Read mode |\n|---|---|---|---|\n${rows}`;
    })
    .join('\n\n');

  const legacyRows = connectorDirectory
    .filter((connector) => connector.maturity === 'deprecated')
    .map((connector) => `- [${connector.title}](/docs/connectors/${connector.slug}) — Deprecated; use the named replacement for new pipelines.`)
    .join('\n');

  return legacyRows ? `${active}\n\n## Legacy connectors\n\n${legacyRows}` : active;
}
