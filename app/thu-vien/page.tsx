import { SiteHeader } from "../components/site-header";
import { ContinueWatching } from "../components/continue-watching";
import { LibraryWatchlist } from "../components/library-watchlist";

export default async function SchedulePage() {
    return (
        <main className="min-h-screen bg-[#0a0a0c] px-4 py-20 text-white sm:px-8 lg:px-10">
            <SiteHeader />
            <div className="mx-auto max-w-[96rem] space-y-12">
                <ContinueWatching />
                <LibraryWatchlist />
            </div>
        </main>
    );
}
