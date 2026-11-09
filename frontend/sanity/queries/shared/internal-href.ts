import { groq } from "next-sanity";
import { publicVisibilityFilterFor } from "../../../../shared/public-visibility";

// Every resolver opens with the Hidden rule: a link to a Hidden document
// yields no href, so the header and footer drop it and buttons render
// without a destination instead of leading to a 404.

export const customLinkInternalHref = groq`select(
  !(${publicVisibilityFilterFor("customLink.internal")}) => null,
  customLink.internal->_id == "homePage" || customLink.internal->_type == "homePage" => "/",
  customLink.internal->_type == "post" && defined(customLink.internal->slug.current) => "/stories/" + array::join(string::split(customLink.internal->slug.current, "/")[@ != ""], "/"),
  customLink.internal->_type == "category" && defined(customLink.internal->slug.current) => "/stories/category/" + array::join(string::split(customLink.internal->slug.current, "/")[@ != ""], "/"),
  defined(customLink.internal->slug.current) => "/" + array::join(string::split(customLink.internal->slug.current, "/")[@ != ""], "/")
)`;

export const urlInternalHref = groq`select(
  !(${publicVisibilityFilterFor("url.internal")}) => null,
  url.internal->_id == "homePage" || url.internal->_type == "homePage" => "/",
  url.internal->_id == "blogIndex" || url.internal->_type == "blogIndex" => "/stories",
  url.internal->_type == "post" && defined(url.internal->slug.current) => "/stories/" + array::join(string::split(url.internal->slug.current, "/")[@ != ""], "/"),
  url.internal->_type == "category" && defined(url.internal->slug.current) => "/stories/category/" + array::join(string::split(url.internal->slug.current, "/")[@ != ""], "/"),
  defined(url.internal->slug.current) => "/" + array::join(string::split(url.internal->slug.current, "/")[@ != ""], "/")
)`;

/** The navigation and footer destination type (`destination.internal`). */
export const internalReferenceHref = groq`select(
  !(${publicVisibilityFilterFor("internal")}) => null,
  internal->_id == "homePage" || internal->_type == "homePage" => "/",
  internal->_id == "blogIndex" || internal->_type == "blogIndex" => "/stories",
  internal->_type == "post" && defined(internal->slug.current) => "/stories/" + array::join(string::split(internal->slug.current, "/")[@ != ""], "/"),
  internal->_type == "category" && defined(internal->slug.current) => "/stories/category/" + array::join(string::split(internal->slug.current, "/")[@ != ""], "/"),
  defined(internal->slug.current) => "/" + array::join(string::split(internal->slug.current, "/")[@ != ""], "/")
)`;

export const linkInternalHref = groq`select(
  !(${publicVisibilityFilterFor("link.internal")}) => null,
  link.internal->_id == "homePage" || link.internal->_type == "homePage" => "/",
  link.internal->_id == "blogIndex" || link.internal->_type == "blogIndex" => "/stories",
  link.internal->_type == "post" && defined(link.internal->slug.current) => "/stories/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/"),
  link.internal->_type == "category" && defined(link.internal->slug.current) => "/stories/category/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/"),
  defined(link.internal->slug.current) => "/" + array::join(string::split(link.internal->slug.current, "/")[@ != ""], "/")
)`;

export const legacyInternalLinkHref = groq`select(
  !(${publicVisibilityFilterFor("@.internalLink")}) => null,
  @.internalLink->_id == "homePage" || @.internalLink->_type == "homePage" => "/",
  @.internalLink->_type == "post" && defined(@.internalLink->slug.current) => "/stories/" + array::join(string::split(@.internalLink->slug.current, "/")[@ != ""], "/"),
  @.internalLink->_type == "category" && defined(@.internalLink->slug.current) => "/stories/category/" + array::join(string::split(@.internalLink->slug.current, "/")[@ != ""], "/"),
  defined(@.internalLink->slug.current) => "/" + array::join(string::split(@.internalLink->slug.current, "/")[@ != ""], "/")
)`;
