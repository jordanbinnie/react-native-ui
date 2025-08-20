const plugin = require("tailwindcss/plugin");

/**
 * Basically simulating how tailwind handles HTML data-attributes but for nativewind
 */
module.exports = plugin(function ({ matchVariant }) {
  // Custom state variant
  // Example usage:
  //  <View
  //    custom-state="open"
  //    className="custom-[state=open]:opacity-100 custom-[state=closed]:opacity-0"
  //  />
  matchVariant(
    "custom",
    (value) => {
      const match = value.match(/^state=(.+)$/);
      if (!match) return null;
      // Strip optional surrounding quotes from the value
      const raw = match[1];
      const normalized = raw.replace(/^['"]|['"]$/g, "");
      return `&[custom-state="${normalized}"]`;
    },
    {
      values: {},
    }
  );

  // Group custom state variant
  // Example usage:
  //  <View
  //    custom-state="open"
  //    className="group"
  //  >
  //    <View
  //      className="group-custom-[state=open]:opacity-100 group-custom-[state=closed]:opacity-0"
  //    />
  //  </View>
  matchVariant(
    "group-custom",
    (value, { modifier }) => {
      const match = value.match(/^state=(.+)$/);
      if (!match) return null;
      const raw = match[1];
      const normalized = raw.replace(/^['"]|['"]$/g, "");
      // Support named groups: group/header vs default group
      return modifier
        ? `.group\\/${modifier}[custom-state="${normalized}"] &`
        : `.group[custom-state="${normalized}"] &`;
    },
    {
      values: {},
    }
  );
});
