import { defineQuery } from "next-sanity";
import { imageQuery } from "./shared/image";
import { internalReferenceHref } from "./shared/internal-href";

const destinationProjection = `{
  openInNewTab,
  "href": select(
    kind == "internal" => ${internalReferenceHref},
    kind == "external" => external
  )
}`;

const linkProjection = `{
  _key,
  label,
  destination${destinationProjection}
}`;

export const FOOTER_QUERY = defineQuery(`
  *[_type == "footer" && _id == "footer"][0]{
    _id,
    heading,
    accent,
    actions[]${linkProjection},
    logos[]{
      _key,
      alt,
      image{
        ${imageQuery}
      },
      destination${destinationProjection}
    },
    contactLinks[]{
      _key,
      icon,
      label,
      destination${destinationProjection}
    },
    columns[]{
      _key,
      heading,
      links[]${linkProjection}
    },
    "legalLinks": coalesce(legalLinks, compliance.legalLinks)[]${linkProjection},
    "copyrightStartYear": coalesce(copyrightStartYear, compliance.copyrightStartYear),
    "copyrightOwner": coalesce(copyrightOwner, compliance.copyrightOwner),
    charityStatement
  }
`);
