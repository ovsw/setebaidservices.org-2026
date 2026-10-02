import { benefitCardsQuery } from "./benefit-cards";
import { ctaBannerQuery } from "./cta-banner";
import { faqAccordionQuery } from "./faq-accordion";
import { latestArticlesQuery } from "./latest-articles";
import { richTextBlockQuery } from "./rich-text-block";
import { storyFeatureQuery } from "./story-feature";
import { teamMembersQuery } from "./team-members";
import { heroQuery } from "./hero";
import { homeHeroQuery } from "./home-hero";
import { imageCollageFeatureQuery } from "./image-collage-feature";
import { featureCardsQuery } from "./feature-cards";
import { stackedFeatureRowsQuery } from "./stacked-feature-rows";
import { innerHeroQuery } from "./inner-hero";
import { journeyQuery } from "./journey";
import { stackedTimelineQuery } from "./stacked-timeline";
import { includedExtrasQuery } from "./included-extras";
import { packingChecklistQuery } from "./packing-checklist";
import { bigImageListQuery } from "./big-image-list";
import { directorCtaQuery } from "./director-cta";
import { largeSlidesQuery } from "./large-slides";
import { headingImageQuery } from "./heading-image";
import { quoteWallQuery } from "./quote-wall";
import { pricingSingleToggleQuery } from "./pricing-single-toggle";
import { faqHubQuery } from "./faq-hub";
import { wordSwapQuery } from "./word-swap";
import { flipCardsQuery } from "./flip-cards";
import { photoStripQuery } from "./photo-strip";
import { pricingTiersQuery } from "./pricing-tiers";
// page-builder-generator:query-imports
import { internationalCampersSectionQuery } from "./international-campers-section";

export const pageBuilderQuery = `
  blocks[]{
    _key,
    _type,
    !(_type in ["hero", "homeHero", "innerHero", "internationalCampersSection"]) => {background},
    ${latestArticlesQuery},
    ${faqAccordionQuery},
    ${storyFeatureQuery},
    ${teamMembersQuery},
    ${richTextBlockQuery},
    ${ctaBannerQuery},
    ${benefitCardsQuery},
    ${heroQuery},
    ${homeHeroQuery},
    ${imageCollageFeatureQuery},
    ${featureCardsQuery},
    ${stackedFeatureRowsQuery},
    ${innerHeroQuery},
    ${journeyQuery},
    ${stackedTimelineQuery},
    ${includedExtrasQuery},
    ${packingChecklistQuery},
    ${bigImageListQuery},
    ${directorCtaQuery},
    ${largeSlidesQuery},
    ${headingImageQuery},
    ${quoteWallQuery},
    ${pricingSingleToggleQuery},
    ${faqHubQuery},
    ${wordSwapQuery},
    ${flipCardsQuery},
    ${photoStripQuery},
    ${pricingTiersQuery},
    ${"" /* page-builder-generator:query-spreads */}
    ${internationalCampersSectionQuery}
  }
`;
