import Hero from "@/src/components/sections/Hero";
import Offer from "@/src/components/sections/Offer";
import MarqueeStrip from "@/src/components/sections/MarqueeStrip";
import Solutions from "@/src/components/sections/Solutions";
import WhyChoose from "@/src/components/sections/WhyChoose";
import Industries from "@/src/components/sections/Industries";
import CoverageChecker from "@/src/components/sections/CoverageChecker";
import Testimonials from "@/src/components/sections/Testimonials";
import Request from "@/src/components/sections/Request";
import NewsletterStrip from "@/src/components/sections/NewsletterStrip";
import Questions from "@/src/components/sections/Questions";
import ReviewSubmission from "@/src/components/sections/ReviewSubmission";

export default function Home() {
    return (
        <div className="max-w-[2000px] mx-auto overflow-x-hidden">
            <Hero />
            <Offer />
            <Solutions />
            <WhyChoose />
            <Industries />
            <CoverageChecker />
            <MarqueeStrip speed="slow" />
            <Testimonials />
            <ReviewSubmission />
            <Request />
            <NewsletterStrip />
            <Questions />
        </div>
    );
}
