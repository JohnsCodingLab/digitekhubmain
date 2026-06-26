import Navbar from "@/src/components/layout/Navbar";
import Footer from "@/src/components/layout/Footer";

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Navbar />
            <main id="main-content">{children}</main>
            <Footer />
        </>
    );
}
