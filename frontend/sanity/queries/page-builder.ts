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
import { activityScheduleQuery } from "./activity-schedule";
import { facilitiesMapSectionQuery } from "./facilities-map-section";
import { datesRatesSectionQuery } from "./dates-rates-section";
import { stackedFeatureRowsQuery } from "./stacked-feature-rows";
import { innerHeroQuery } from "./inner-hero";
import { journeyQuery } from "./journey";
import { stackedTimelineQuery } from "./stacked-timeline";
import { activityCatalogueQuery } from "./activity-catalogue";
import { includedExtrasQuery } from "./included-extras";
import { packingChecklistQuery } from "./packing-checklist";
import { bigImageListQuery } from "./big-image-list";
import { directorCtaQuery } from "./director-cta";
import { largeSlidesQuery } from "./large-slides";
import { headingImageQuery } from "./heading-image";
import { quoteWallQuery } from "./quote-wall";
import { pricingSingleToggleQuery } from "./pricing-single-toggle";
import { faqHubQuery } from "./faq-hub";
// page-builder-generator:query-imports
import { internationalCampersSectionQuery } from "./international-campers-section";

export const pageBuilderQuery = `
  blocks[]{
    _key,
    _type,
    !(_type in ["hero", "homeHero", "innerHero", "facilitiesMapSection", "internationalCampersSection"]) => {background},
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
    ${activityScheduleQuery},
    ${facilitiesMapSectionQuery},
    ${datesRatesSectionQuery},
    ${stackedFeatureRowsQuery},
    ${innerHeroQuery},
    ${journeyQuery},
    ${stackedTimelineQuery},
    ${activityCatalogueQuery},
    ${includedExtrasQuery},
    ${packingChecklistQuery},
    ${bigImageListQuery},
    ${directorCtaQuery},
    ${largeSlidesQuery},
    ${headingImageQuery},
    ${quoteWallQuery},
    ${pricingSingleToggleQuery},
    ${faqHubQuery},
    ${"" /* page-builder-generator:query-spreads */}
    ${internationalCampersSectionQuery}
  }
`;
