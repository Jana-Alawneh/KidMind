import api from "../../services/api";


export const getUserInitials =
  value => {

    const parts =
      String(
        value || ""
      )
        .trim()
        .split(/\s+/)
        .filter(Boolean);


    if (
      parts.length === 0
    ) {
      return "U";
    }


    return parts
      .slice(
        0,
        2
      )
      .map(
        part =>
          part
            .charAt(0)
            .toUpperCase()
      )
      .join("");

  };


export const resolveUserAvatarUrl =
  value => {

    const avatarUrl =
      String(
        value || ""
      ).trim();


    if (!avatarUrl) {
      return "";
    }


    if (
      /^(https?:|data:|blob:)/i.test(
        avatarUrl
      )
    ) {
      return avatarUrl;
    }


    const baseUrl =
      String(
        api.defaults.baseURL ||
        ""
      ).trim();


    if (!baseUrl) {
      return avatarUrl;
    }


    try {

      return new URL(
        avatarUrl,
        baseUrl
      ).toString();

    } catch {

      const normalizedBase =
        baseUrl.replace(
          /\/$/,
          ""
        );


      return avatarUrl.startsWith(
        "/"
      )
        ? `${normalizedBase}${avatarUrl}`
        : `${normalizedBase}/${avatarUrl}`;

    }

  };


export default function UserAvatar({
  user,
  name,
  avatarUrl,
  className = "",
  alt,
  fallback = null,
}) {

  const resolvedName =
    String(
      name ||
      user?.full_name ||
      "User"
    ).trim();


  const resolvedAvatar =
    resolveUserAvatarUrl(
      avatarUrl ??
      user?.avatar_url
    );


  const fallbackContent =
    fallback || (
      <span>
        {
          getUserInitials(
            resolvedName
          )
        }
      </span>
    );


  return (

    <div
      className={
        className
      }
      title={
        resolvedName
      }
      style={{
        overflow:
          "hidden",
        borderRadius:
          "inherit",
      }}
    >

      {
        resolvedAvatar
          ? (

            <img
              src={
                resolvedAvatar
              }
              alt={
                alt ||
                `${resolvedName} profile`
              }
              onError={
                event => {

                  event.currentTarget.style.display =
                    "none";


                  const fallbackElement =
                    event.currentTarget
                      .nextElementSibling;


                  if (
                    fallbackElement
                  ) {

                    fallbackElement.style.display =
                      "";

                  }

                }
              }
              style={{
                width:
                  "100%",
                height:
                  "100%",
                display:
                  "block",
                objectFit:
                  "cover",
              }}
            />

          )
          : null
      }


      <span
        style={{
          display:
            resolvedAvatar
              ? "none"
              : "",
        }}
      >
        {
          fallbackContent
        }
      </span>

    </div>

  );

}