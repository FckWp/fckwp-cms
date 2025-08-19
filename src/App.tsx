import { Route, Switch, useRoute } from 'wouter';
import Admin from './admin';
import AdminPages from './admin/pages';
import HeroSliderBuilder from './admin/hero-slider';
import AdminLogin from './admin/login';
import ProtectedAdminRoute from './ProtectedAdminRoute';
// @ts-expect-error - NotFound is dynamically generated
import { NotFound } from '@/components/NotFound';
import DynamicPage from '@/components/DynamicPage';

function App() {
  return (
    <Switch>
      <Route path="/admin">
        <ProtectedAdminRoute component={Admin} />
      </Route>

      <Route path="/admin/pages">
        <ProtectedAdminRoute component={AdminPages} />
      </Route>

      <Route path="/admin/hero-slider">
        <ProtectedAdminRoute component={HeroSliderBuilder} />
      </Route>

      <Route path="/admin/login" component={AdminLogin} />

      <Route path="/:slug*">
        <PageWrapper />
      </Route>

      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function PageWrapper() {
  const [, params] = useRoute('/:slug*');
  const slugRaw = params?.slug ?? '';
  const slug = slugRaw === '' ? 'home' : slugRaw;

  return <DynamicPage slug={slug} />;
}

export default App;
