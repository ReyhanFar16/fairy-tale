function extractPathnameSegments(pathname) {
  const splitPath = pathname.split("/");

  return {
    resource: splitPath[1] || null,
    id: splitPath[2] || null,
  };
}

function parsePathnameSegments(pathname) {
  const splitPath = pathname.split("/");

  return {
    resource: splitPath[1] || null,
    id: splitPath[2] || null,
  };
}

function constructRouteFromSegments(pathSegments) {
  let pathname = "";

  if (pathSegments.resource) {
    pathname = pathname.concat(`/${pathSegments.resource}`);
  }

  if (pathSegments.id) {
    pathname = pathname.concat("/:id");
  }

  return pathname || "/";
}

function getActivePathname() {
  return location.hash.replace("#", "") || "/";
}

export function getActiveRoute() {
  const pathname = getActivePathname();
  const pathSegments = parsePathnameSegments(pathname);

  return constructRouteFromSegments(pathSegments);
}

export function parseActivePathname() {
  const url = window.location.hash.slice(1).toLowerCase();
  const splitUrl = url.split("/");

  if (splitUrl[1] === "stories" && splitUrl[2]) {
    console.log(`Extracted ID: ${splitUrl[2]}`);
    return { id: splitUrl[2] };
  }

  return {};
}
