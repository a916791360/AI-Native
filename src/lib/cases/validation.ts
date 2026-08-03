import path from 'node:path';

import type { ProjectContent } from '../content/io';
import { CASE_STAGE_IDS, type CaseStudy } from './schema';
import type { CaseStudyDocument } from './io';

export interface CaseStudyDiagnostic {
  code: string;
  filePath: string;
  fieldPath: string;
  message: string;
}

export class CaseStudyValidationError extends Error {
  constructor(readonly diagnostics: CaseStudyDiagnostic[]) {
    super(diagnostics.map(formatCaseStudyDiagnostic).join('\n'));
    this.name = 'CaseStudyValidationError';
  }
}

export function formatCaseStudyDiagnostic(diagnostic: CaseStudyDiagnostic): string {
  return `[${diagnostic.code}] ${diagnostic.filePath}#${diagnostic.fieldPath}: ${diagnostic.message}`;
}

function addDiagnostic(
  diagnostics: CaseStudyDiagnostic[],
  code: string,
  filePath: string,
  fieldPath: string,
  message: string,
): void {
  diagnostics.push({ code, filePath, fieldPath, message });
}

function duplicateIds<T extends { id: string }>(
  values: T[],
  diagnostics: CaseStudyDiagnostic[],
  filePath: string,
  fieldPath: string,
  code: string,
): void {
  const owners = new Map<string, number>();
  values.forEach((value, index) => {
    const owner = owners.get(value.id);
    if (owner !== undefined) {
      addDiagnostic(
        diagnostics,
        code,
        filePath,
        `${fieldPath}.${index}.id`,
        `duplicates ${fieldPath}.${owner}.id (${value.id})`,
      );
    } else {
      owners.set(value.id, index);
    }
  });
}

function caseFileId(filePath: string): string {
  return path.basename(filePath).replace(/\.ya?ml$/, '');
}

function validateReferenceShape(
  reference: CaseStudy['references'][number],
  index: number,
  filePath: string,
  diagnostics: CaseStudyDiagnostic[],
): void {
  if (reference.kind === 'source') {
    if (!reference.url) {
      addDiagnostic(
        diagnostics,
        'CASE_SOURCE_URL_REQUIRED',
        filePath,
        `references.${index}.url`,
        'source references require an HTTPS URL',
      );
    }
    if (reference.targetId) {
      addDiagnostic(
        diagnostics,
        'CASE_SOURCE_TARGET_FORBIDDEN',
        filePath,
        `references.${index}.targetId`,
        'source references must not use targetId',
      );
    }
    for (const field of ['publisher', 'accessedAt', 'stability'] as const) {
      if (!reference[field]) {
        addDiagnostic(
          diagnostics,
          'CASE_SOURCE_METADATA_REQUIRED',
          filePath,
          `references.${index}.${field}`,
          `source references require ${field}`,
        );
      }
    }
    return;
  }

  if (!reference.targetId) {
    addDiagnostic(
      diagnostics,
      'CASE_REFERENCE_TARGET_REQUIRED',
      filePath,
      `references.${index}.targetId`,
      `${reference.kind} references require targetId`,
    );
  }
  if (reference.url) {
    addDiagnostic(
      diagnostics,
      'CASE_REFERENCE_URL_FORBIDDEN',
      filePath,
      `references.${index}.url`,
      `${reference.kind} references resolve through project content, not a source URL`,
    );
  }
  if (reference.publisher || reference.accessedAt || reference.stability) {
    addDiagnostic(
      diagnostics,
      'CASE_REFERENCE_SOURCE_METADATA_FORBIDDEN',
      filePath,
      `references.${index}`,
      `${reference.kind} references must not include source metadata`,
    );
  }
}

function validateLifecycle(
  caseStudy: CaseStudy,
  filePath: string,
  diagnostics: CaseStudyDiagnostic[],
): void {
  const gateStatuses = caseStudy.gates.map(({ status }) => status);
  if (caseStudy.status === 'verified') {
    if (!caseStudy.verifiedAt) {
      addDiagnostic(
        diagnostics,
        'CASE_VERIFIED_DATE_REQUIRED',
        filePath,
        'verifiedAt',
        'verified cases require verifiedAt',
      );
    }
    if (gateStatuses.some((status) => status !== 'verified')) {
      addDiagnostic(
        diagnostics,
        'CASE_STATUS_INCONSISTENT',
        filePath,
        'status',
        'verified cases require every gate to be verified',
      );
    }
  } else if (caseStudy.verifiedAt) {
    addDiagnostic(
      diagnostics,
      'CASE_VERIFIED_DATE_FORBIDDEN',
      filePath,
      'verifiedAt',
      'only verified cases may set verifiedAt',
    );
  }

  if (caseStudy.status === 'planned' && gateStatuses.some((status) => status !== 'planned')) {
    addDiagnostic(
      diagnostics,
      'CASE_STATUS_INCONSISTENT',
      filePath,
      'status',
      'planned cases require every gate to be planned',
    );
  }
  if (caseStudy.status === 'draft' && gateStatuses.some((status) => status !== 'draft')) {
    addDiagnostic(
      diagnostics,
      'CASE_STATUS_INCONSISTENT',
      filePath,
      'status',
      'draft cases require every gate to be draft',
    );
  }
  if (
    caseStudy.status === 'needs-review' &&
    gateStatuses.every((status) => status !== 'needs-review')
  ) {
    addDiagnostic(
      diagnostics,
      'CASE_STATUS_INCONSISTENT',
      filePath,
      'status',
      'needs-review cases require at least one needs-review gate',
    );
  }
}

function validateCase(
  document: CaseStudyDocument,
  project: ProjectContent,
  diagnostics: CaseStudyDiagnostic[],
): void {
  const { data: caseStudy, filePath } = document;
  if (caseFileId(filePath) !== caseStudy.id) {
    addDiagnostic(
      diagnostics,
      'CASE_FILE_ID',
      filePath,
      'id',
      `must match filename ${caseFileId(filePath)}`,
    );
  }

  duplicateIds(caseStudy.gates, diagnostics, filePath, 'gates', 'CASE_GATE_DUPLICATE_ID');
  duplicateIds(
    caseStudy.artifacts,
    diagnostics,
    filePath,
    'artifacts',
    'CASE_ARTIFACT_DUPLICATE_ID',
  );
  duplicateIds(caseStudy.metrics, diagnostics, filePath, 'metrics', 'CASE_METRIC_DUPLICATE_ID');
  duplicateIds(
    caseStudy.failureModes,
    diagnostics,
    filePath,
    'failureModes',
    'CASE_FAILURE_DUPLICATE_ID',
  );
  duplicateIds(
    caseStudy.references,
    diagnostics,
    filePath,
    'references',
    'CASE_REFERENCE_DUPLICATE_ID',
  );

  const claims = [
    ...caseStudy.baseline,
    ...caseStudy.constraints,
    ...caseStudy.gates.flatMap((gate) => [...gate.facts, ...gate.unknowns]),
  ];
  duplicateIds(claims, diagnostics, filePath, 'claims', 'CASE_CLAIM_DUPLICATE_ID');

  const artifactIds = new Set(caseStudy.artifacts.map(({ id }) => id));
  const metricIds = new Set(caseStudy.metrics.map(({ id }) => id));
  const failureModeIds = new Set(caseStudy.failureModes.map(({ id }) => id));
  const references = new Map(caseStudy.references.map((reference) => [reference.id, reference]));
  const termIds = new Set(project.terms.map(({ data }) => data.id));
  const routeIds = new Set(project.routes.map(({ data }) => data.id));

  caseStudy.references.forEach((reference, index) => {
    validateReferenceShape(reference, index, filePath, diagnostics);
    if (reference.kind === 'term' && reference.targetId && !termIds.has(reference.targetId)) {
      addDiagnostic(
        diagnostics,
        'CASE_REFERENCE_UNKNOWN',
        filePath,
        `references.${index}.targetId`,
        `unknown term ${reference.targetId}`,
      );
    }
    if (reference.kind === 'route' && reference.targetId && !routeIds.has(reference.targetId)) {
      addDiagnostic(
        diagnostics,
        'CASE_REFERENCE_UNKNOWN',
        filePath,
        `references.${index}.targetId`,
        `unknown route ${reference.targetId}`,
      );
    }
  });

  caseStudy.gates.forEach((gate, index) => {
    if (gate.order !== index + 1) {
      addDiagnostic(
        diagnostics,
        'CASE_GATE_ORDER',
        filePath,
        `gates.${index}.order`,
        `expected ${index + 1}`,
      );
    }
    if (gate.stageId !== CASE_STAGE_IDS[index]) {
      addDiagnostic(
        diagnostics,
        'CASE_STAGE_ORDER',
        filePath,
        `gates.${index}.stageId`,
        `expected ${CASE_STAGE_IDS[index]}`,
      );
    }

    duplicateIds(
      gate.options,
      diagnostics,
      filePath,
      `gates.${index}.options`,
      'CASE_OPTION_DUPLICATE_ID',
    );
    if (gate.options.filter(({ assessment }) => assessment === 'recommended').length !== 1) {
      addDiagnostic(
        diagnostics,
        'CASE_OPTION_RECOMMENDED_COUNT',
        filePath,
        `gates.${index}.options`,
        'each gate requires exactly one recommended option',
      );
    }

    if (gate.failureModeIds.length === 0) {
      addDiagnostic(
        diagnostics,
        'CASE_GATE_FAILURE_REQUIRED',
        filePath,
        `gates.${index}.failureModeIds`,
        'every gate requires at least one failure mode',
      );
    }

    for (const [field, values, known, code] of [
      ['artifactIds', gate.artifactIds, artifactIds, 'CASE_ARTIFACT_REFERENCE_UNKNOWN'],
      ['metricIds', gate.metricIds, metricIds, 'CASE_METRIC_REFERENCE_UNKNOWN'],
      ['failureModeIds', gate.failureModeIds, failureModeIds, 'CASE_FAILURE_REFERENCE_UNKNOWN'],
    ] as const) {
      values.forEach((value, valueIndex) => {
        if (!known.has(value)) {
          addDiagnostic(
            diagnostics,
            code,
            filePath,
            `gates.${index}.${field}.${valueIndex}`,
            `unknown ${value}`,
          );
        }
      });
    }

    gate.referenceIds.forEach((referenceId, referenceIndex) => {
      if (!references.has(referenceId)) {
        addDiagnostic(
          diagnostics,
          'CASE_GATE_REFERENCE_UNKNOWN',
          filePath,
          `gates.${index}.referenceIds.${referenceIndex}`,
          `unknown reference ${referenceId}`,
        );
      }
    });
  });

  caseStudy.metrics.forEach((metric, index) => {
    if (metric.thresholdStatus === 'defined' && !metric.threshold) {
      addDiagnostic(
        diagnostics,
        'CASE_METRIC_THRESHOLD_REQUIRED',
        filePath,
        `metrics.${index}.threshold`,
        'defined metrics require a threshold',
      );
    }
    if (metric.thresholdStatus === 'baseline-needed' && metric.threshold) {
      addDiagnostic(
        diagnostics,
        'CASE_METRIC_THRESHOLD_FORBIDDEN',
        filePath,
        `metrics.${index}.threshold`,
        'baseline-needed metrics must not invent a threshold',
      );
    }
  });

  validateLifecycle(caseStudy, filePath, diagnostics);
}

export function validateCaseStudies(
  cases: CaseStudyDocument[],
  project: ProjectContent,
): CaseStudyDiagnostic[] {
  const diagnostics: CaseStudyDiagnostic[] = [];
  const caseIds = new Map<string, string>();

  for (const document of cases) {
    const owner = caseIds.get(document.data.id);
    if (owner) {
      addDiagnostic(
        diagnostics,
        'CASE_DUPLICATE_ID',
        document.filePath,
        'id',
        `duplicates ${owner}`,
      );
    } else {
      caseIds.set(document.data.id, document.filePath);
    }
    validateCase(document, project, diagnostics);
  }

  return diagnostics.sort((left, right) =>
    `${left.filePath}|${left.fieldPath}|${left.code}`.localeCompare(
      `${right.filePath}|${right.fieldPath}|${right.code}`,
      'en',
    ),
  );
}

export function assertValidCaseStudies(cases: CaseStudyDocument[], project: ProjectContent): void {
  const diagnostics = validateCaseStudies(cases, project);
  if (diagnostics.length > 0) throw new CaseStudyValidationError(diagnostics);
}
