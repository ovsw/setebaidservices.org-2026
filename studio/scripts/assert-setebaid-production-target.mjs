export const SETEBAID_PRODUCTION_TARGET = {
  dataset: "production",
  projectId: "o36mi5w4",
};

export function assertSetebaidProductionTarget({ dataset, projectId }) {
  if (
    projectId !== SETEBAID_PRODUCTION_TARGET.projectId ||
    dataset !== SETEBAID_PRODUCTION_TARGET.dataset
  ) {
    throw new Error(
      `Refusing to run against ${projectId}/${dataset}; expected ${SETEBAID_PRODUCTION_TARGET.projectId}/${SETEBAID_PRODUCTION_TARGET.dataset}`,
    );
  }
}
