import type { AssertEqual, Equals, Keys, Values, ExperimentId } from "@tne-code/types"

export const EXPERIMENT_IDS = {
	POWER_STEERING: "powerSteering",
	CONCURRENT_FILE_READS: "concurrentFileReads",
	DISABLE_COMPLETION_COMMAND: "disableCompletionCommand",
} as const satisfies Record<string, ExperimentId>

type _AssertExperimentIds = AssertEqual<Equals<ExperimentId, Values<typeof EXPERIMENT_IDS>>>

type ExperimentKey = Keys<typeof EXPERIMENT_IDS>

interface ExperimentConfig {
	enabled: boolean
}

export const experimentConfigsMap: Record<ExperimentKey, ExperimentConfig> = {
	POWER_STEERING: { enabled: false },
	CONCURRENT_FILE_READS: { enabled: false },
	DISABLE_COMPLETION_COMMAND: { enabled: false },
}

export const experimentDefault = Object.fromEntries(
	Object.entries(experimentConfigsMap).map(([_, config]) => [
		EXPERIMENT_IDS[_ as keyof typeof EXPERIMENT_IDS] as ExperimentId,
		config.enabled,
	]),
) as Record<ExperimentId, boolean>

export const experiments = {
	get: (id: ExperimentKey): ExperimentConfig | undefined => experimentConfigsMap[id],
	isEnabled: (experimentsConfig: Record<ExperimentId, boolean>, id: ExperimentId) =>
		experimentsConfig[id] ?? experimentDefault[id],
} as const
