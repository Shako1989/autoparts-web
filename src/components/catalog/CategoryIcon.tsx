import { type ComponentProps, type ReactElement } from 'react';
import {
  Activity,
  AirVent,
  Anchor,
  Aperture,
  Armchair,
  Battery,
  BatteryCharging,
  Bolt,
  Box,
  Cable,
  Camera,
  Car,
  Circle,
  CircleDashed,
  CircleDot,
  CircleGauge,
  CircuitBoard,
  CloudRain,
  Cog,
  Container,
  Cylinder,
  Disc,
  Disc3,
  DoorClosed,
  Droplet,
  Droplets,
  Dumbbell,
  Eye,
  Fan,
  Filter,
  Flame,
  Flashlight,
  FlaskConical,
  Frame,
  Fuel,
  Gauge,
  Grid2x2,
  Hand,
  Heater,
  KeyRound,
  Lamp,
  Layers,
  LifeBuoy,
  Lightbulb,
  Link,
  Magnet,
  Monitor,
  Move,
  MoveHorizontal,
  Octagon,
  Orbit,
  Package,
  PanelTop,
  PlugZap,
  Radar,
  Radio,
  RectangleHorizontal,
  RefreshCw,
  RotateCw,
  Rows3,
  Scan,
  Settings,
  Shield,
  SlidersHorizontal,
  Snowflake,
  Sofa,
  Spline,
  Square,
  Target,
  Thermometer,
  ThermometerSnowflake,
  Tornado,
  Torus,
  Wind,
  Workflow,
  Wrench,
  Zap,
} from 'lucide-react';

interface CategoryIconProps extends ComponentProps<'svg'> {
  slug: string | null | undefined;
}

/**
 * Renders the lucide icon mapped to the given category slug. The slugs are
 * the ones seeded by autoparts-api/scripts/seed-category-tree.sh (11 roots,
 * 75 leaves); anything else gets the generic Package icon. The dispatch is a
 * plain switch instead of a slug -> component map so that no component
 * reference is ever aliased mid-render (which would trip the
 * react-hooks/static-components rule).
 */
export function CategoryIcon({ slug, ...props }: CategoryIconProps): ReactElement {
  switch (slug) {
    // roots
    case 'maintenance':
      return <Wrench {...props} />;
    case 'brakes':
      return <Disc {...props} />;
    case 'suspension':
      return <Activity {...props} />;
    case 'engine':
      return <Cog {...props} />;
    case 'cooling':
      return <Thermometer {...props} />;
    case 'electrical':
      return <Zap {...props} />;
    case 'body':
      return <Car {...props} />;
    case 'interior':
      return <Armchair {...props} />;
    case 'transmission':
      return <Settings {...props} />;
    case 'exhaust-system':
      return <Wind {...props} />;
    case 'hvac':
      return <AirVent {...props} />;

    // maintenance
    case 'oil-filters':
    case 'cabin-filters':
    case 'fuel-filters':
    case 'transmission-filters':
      return <Filter {...props} />;
    case 'air-filters':
      return <Wind {...props} />;
    case 'spark-plugs':
      return <Zap {...props} />;
    case 'drive-belts':
      return <RotateCw {...props} />;
    case 'wiper-blades':
      return <CloudRain {...props} />;
    case 'engine-oil':
    case 'brake-fluid':
      return <Droplet {...props} />;
    case 'fluids':
      return <FlaskConical {...props} />;

    // brakes
    case 'brake-pads':
      return <Square {...props} />;
    case 'brake-discs':
      return <Disc {...props} />;
    case 'brake-calipers':
      return <Magnet {...props} />;
    case 'brake-hoses':
      return <Cable {...props} />;
    case 'abs-sensors':
      return <Radar {...props} />;
    case 'parking-brake':
      return <Hand {...props} />;

    // suspension & steering
    case 'shock-absorbers':
      return <Activity {...props} />;
    case 'strut-mounts':
      return <Target {...props} />;
    case 'control-arms':
      return <Move {...props} />;
    case 'ball-joints':
      return <CircleDot {...props} />;
    case 'stabilizer-links':
      return <Link {...props} />;
    case 'suspension-bushings':
      return <Circle {...props} />;
    case 'wheel-bearings':
      return <LifeBuoy {...props} />;
    case 'tie-rods':
      return <MoveHorizontal {...props} />;
    case 'steering-racks':
      return <Disc3 {...props} />;
    case 'front-axle':
      return <Dumbbell {...props} />;

    // engine
    case 'ignition-coils':
      return <PlugZap {...props} />;
    case 'engine-mounts':
    case 'transmission-mounts':
      return <Anchor {...props} />;
    case 'timing-belts':
      return <RefreshCw {...props} />;
    case 'gaskets-seals':
      return <Torus {...props} />;
    case 'fuel-system':
      return <Fuel {...props} />;
    case 'turbochargers':
      return <Tornado {...props} />;
    case 'engine-sensors':
      return <Gauge {...props} />;
    case 'intake':
      return <Aperture {...props} />;

    // cooling
    case 'radiator':
      return <Rows3 {...props} />;
    case 'water-pumps':
      return <Droplets {...props} />;
    case 'thermostats':
      return <Thermometer {...props} />;
    case 'radiator-fans':
    case 'blower-motors':
      return <Fan {...props} />;
    case 'coolant-hoses':
      return <Spline {...props} />;
    case 'expansion-tanks':
      return <Container {...props} />;
    case 'intercoolers':
      return <ThermometerSnowflake {...props} />;

    // electrical & lighting
    case 'batteries':
      return <Battery {...props} />;
    case 'alternators':
      return <BatteryCharging {...props} />;
    case 'starters':
      return <Bolt {...props} />;
    case 'headlights':
      return <Lightbulb {...props} />;
    case 'tail-lights':
      return <Octagon {...props} />;
    case 'fog-lights':
      return <Flashlight {...props} />;
    case 'bulbs':
      return <Lamp {...props} />;
    case 'parking-sensors':
      return <Camera {...props} />;

    // body
    case 'bumpers':
      return <RectangleHorizontal {...props} />;
    case 'fenders':
      return <Shield {...props} />;
    case 'hoods':
      return <PanelTop {...props} />;
    case 'grilles':
      return <Grid2x2 {...props} />;
    case 'mirrors':
      return <Eye {...props} />;
    case 'doors':
      return <DoorClosed {...props} />;
    case 'door-handles-locks':
      return <KeyRound {...props} />;
    case 'trunk-lids':
      return <Box {...props} />;
    case 'radiator-supports':
      return <Frame {...props} />;
    case 'glass':
      return <Scan {...props} />;

    // interior
    case 'seats':
      return <Sofa {...props} />;
    case 'dashboard':
      return <CircleGauge {...props} />;
    case 'infotainment':
      return <Monitor {...props} />;

    // transmission
    case 'cv-axles':
      return <Orbit {...props} />;
    case 'clutches':
      return <CircleDashed {...props} />;
    case 'transmission-solenoids':
      return <CircuitBoard {...props} />;

    // exhaust
    case 'mufflers':
      return <Cylinder {...props} />;
    case 'catalytic-converters':
      return <Flame {...props} />;
    case 'exhaust-manifolds':
      return <Workflow {...props} />;
    case 'oxygen-sensors':
      return <Radio {...props} />;

    // heating & A/C
    case 'ac-compressors':
      return <Snowflake {...props} />;
    case 'condensers':
      return <Layers {...props} />;
    case 'evaporators-heater-cores':
      return <Heater {...props} />;
    case 'hvac-controls':
      return <SlidersHorizontal {...props} />;

    default:
      return <Package {...props} />;
  }
}
