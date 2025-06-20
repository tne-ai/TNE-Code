import { getRuns } from "@tne-code/evals"

import { Home } from "./home"

export const dynamic = "force-dynamic"

export default async function Page() {
	const runs = await getRuns()
	return <Home runs={runs} />
}
