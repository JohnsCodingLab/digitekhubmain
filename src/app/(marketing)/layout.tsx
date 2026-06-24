import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";
import { OnArrivePopup } from "@/src/components/common/OnArrivePopup";
import { ExitIntentPopup } from "@/src/components/common/ExitIntentPopup";

export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main id="main-content">{children}</main>
            <Footer />

            {/* Lead capture popups — fire based on their own triggers */}
            <OnArrivePopup />
            <ExitIntentPopup />
        </>
    );
}
