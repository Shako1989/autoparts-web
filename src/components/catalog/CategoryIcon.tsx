import { type ComponentProps, type ReactElement } from 'react';
import {
  Activity,
  Battery,
  Car,
  CircleDot,
  Cog,
  Disc,
  Droplet,
  Eye,
  Filter,
  Lightbulb,
  Move,
  Package,
  Plug,
  RotateCw,
  Square,
  Wind,
  Zap,
} from 'lucide-react';

interface CategoryIconProps extends ComponentProps<'svg'> {
  slug: string | null | undefined;
}

/**
 * Renders the lucide icon mapped to the given category slug. The dispatch
 * is a plain switch instead of a slug -> component map so that no
 * component reference is ever aliased mid-render (which would trip the
 * react-hooks/static-components rule).
 */
export function CategoryIcon({ slug, ...props }: CategoryIconProps): ReactElement {
  switch (slug) {
    // root categories
    case 'brakes':
      return <Disc {...props} />;
    case 'suspension':
      return <Activity {...props} />;
    case 'engine':
      return <Cog {...props} />;
    case 'electrical':
      return <Zap {...props} />;
    case 'body':
      return <Car {...props} />;

    // brakes children
    case 'brake-pads':
      return <Square {...props} />;
    case 'brake-discs':
      return <Disc {...props} />;
    case 'brake-fluid':
      return <Droplet {...props} />;

    // suspension children
    case 'shock-absorbers':
      return <Activity {...props} />;
    case 'control-arms':
      return <Move {...props} />;
    case 'ball-joints':
      return <CircleDot {...props} />;

    // engine children
    case 'oil-filters':
      return <Filter {...props} />;
    case 'air-filters':
      return <Wind {...props} />;
    case 'spark-plugs':
      return <Zap {...props} />;
    case 'timing-belts':
      return <RotateCw {...props} />;

    // electrical children
    case 'batteries':
      return <Battery {...props} />;
    case 'alternators':
      return <Plug {...props} />;
    case 'headlights':
      return <Lightbulb {...props} />;

    // body children
    case 'bumpers':
      return <Square {...props} />;
    case 'mirrors':
      return <Eye {...props} />;

    default:
      return <Package {...props} />;
  }
}
