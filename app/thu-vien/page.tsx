import { SiteHeader } from "../components/site-header";
import { ContinueWatching } from "../components/continue-watching";





export default async function SchedulePage() {
    return (
        <main className="min-h-screen bg-black px-4 py-6 text-white sm:px-8 lg:px-10">
            <SiteHeader />
            <div className="mt-12 w-full">
                <ContinueWatching />
            </div>
        </main>
    );
}
