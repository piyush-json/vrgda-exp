import {
  type RouteConfig,
  index,
  layout,
  route
} from '@react-router/dev/routes'

export default [

  layout('layouts/layout.tsx', [
    index('routes/home.tsx'),
    route('launch-token/', 'routes/launch-token/index.tsx'),
    route('token/:id', 'routes/token-details/index.tsx'),
    route('explore/', 'routes/explore.tsx'),
    route('*', 'routes/404.tsx')
  ])
] satisfies RouteConfig
