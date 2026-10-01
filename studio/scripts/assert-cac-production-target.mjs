export const CAC_PRODUCTION_TARGET = {
  dataset: "production",
  projectId: "bf76qlx9",
};

export function assertCacProductionTarget({ dataset, projectId }) {
  if (
    projectId !== CAC_PRODUCTION_TARGET.projectId ||
    dataset !== CAC_PRODUCTION_TARGET.dataset
  ) {
    throw new Error(
      `Refusing to run against ${projectId}/${dataset}; expected ${CAC_PRODUCTION_TARGET.projectId}/${CAC_PRODUCTION_TARGET.dataset}`,
    );
  }
}
