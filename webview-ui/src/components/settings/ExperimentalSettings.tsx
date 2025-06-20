import { HTMLAttributes } from "react"
import { FlaskConical } from "lucide-react"

import type { ExperimentId, CodebaseIndexConfig, CodebaseIndexModels, ProviderSettings } from "@tne-code/types"

import { EXPERIMENT_IDS, experimentConfigsMap } from "@roo/experiments"

import { ExtensionStateContextType } from "@src/context/ExtensionStateContext"
import { useAppTranslation } from "@src/i18n/TranslationContext"
import { cn } from "@src/lib/utils"

import { SetCachedStateField, SetExperimentEnabled } from "./types"
import { SectionHeader } from "./SectionHeader"
import { Section } from "./Section"
import { ExperimentalFeature } from "./ExperimentalFeature"
import { CodeIndexSettings } from "./CodeIndexSettings"
import { ConcurrentFileReadsExperiment } from "./ConcurrentFileReadsExperiment"

type ExperimentalSettingsProps = HTMLAttributes<HTMLDivElement> & {
	experiments: Record<ExperimentId, boolean>
	setExperimentEnabled: SetExperimentEnabled
	maxConcurrentFileReads?: number
	setCachedStateField: SetCachedStateField<"codebaseIndexConfig" | "maxConcurrentFileReads">
	// CodeIndexSettings props
	codebaseIndexModels: CodebaseIndexModels | undefined
	codebaseIndexConfig: CodebaseIndexConfig | undefined
	apiConfiguration: ProviderSettings
	setApiConfigurationField: <K extends keyof ProviderSettings>(field: K, value: ProviderSettings[K]) => void
	areSettingsCommitted: boolean
}

export const ExperimentalSettings = ({
	experiments,
	setExperimentEnabled,
	maxConcurrentFileReads,
	setCachedStateField,
	codebaseIndexModels,
	codebaseIndexConfig,
	apiConfiguration,
	setApiConfigurationField,
	areSettingsCommitted,
	className,
	...props
}: ExperimentalSettingsProps) => {
	const { t } = useAppTranslation()

	return (
		<div className={cn("flex flex-col gap-2", className)} {...props}>
			<SectionHeader>
				<div className="flex items-center gap-2">
					<FlaskConical className="w-4" />
					<div>{t("settings:sections.experimental")}</div>
				</div>
			</SectionHeader>

			<Section>
				{Object.entries(experimentConfigsMap)
					.filter((config) => config[0] !== "DIFF_STRATEGY" && config[0] !== "MULTI_SEARCH_AND_REPLACE")
					.map((config) => {
						if (config[0] === "CONCURRENT_FILE_READS") {
							return (
								<ConcurrentFileReadsExperiment
									key={config[0]}
									enabled={experiments[EXPERIMENT_IDS.CONCURRENT_FILE_READS] ?? false}
									onEnabledChange={(enabled) =>
										setExperimentEnabled(EXPERIMENT_IDS.CONCURRENT_FILE_READS, enabled)
									}
									maxConcurrentFileReads={maxConcurrentFileReads ?? 15}
									onMaxConcurrentFileReadsChange={(value) =>
										setCachedStateField("maxConcurrentFileReads", value)
									}
								/>
							)
						}
						return (
							<ExperimentalFeature
								key={config[0]}
								experimentKey={config[0]}
								enabled={experiments[EXPERIMENT_IDS[config[0] as keyof typeof EXPERIMENT_IDS]] ?? false}
								onChange={(enabled) =>
									setExperimentEnabled(
										EXPERIMENT_IDS[config[0] as keyof typeof EXPERIMENT_IDS],
										enabled,
									)
								}
							/>
						)
					})}

				<CodeIndexSettings
					codebaseIndexModels={codebaseIndexModels}
					codebaseIndexConfig={codebaseIndexConfig}
					apiConfiguration={apiConfiguration}
					setCachedStateField={setCachedStateField as SetCachedStateField<keyof ExtensionStateContextType>}
					setApiConfigurationField={setApiConfigurationField}
					areSettingsCommitted={areSettingsCommitted}
				/>
			</Section>
		</div>
	)
}
