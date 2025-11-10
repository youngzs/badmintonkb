import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroIcon}>
          <div className={styles.iconWrapper}>
            🏸
          </div>
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <p className={styles.heroDescription}>
          专为教练、家长和运动员打造的全方位训练知识平台
        </p>
        <div className={styles.buttons}>
          <Link
            className={clsx('button button--lg', styles.primaryButton)}
            to="/docs">
            <span className={styles.buttonIcon}>👤</span>
            进入知识库
          </Link>
          <Link
            className={clsx('button button--lg', styles.secondaryButton)}
            to="/docs/age-groups/enlightenment-4-6">
            <span className={styles.buttonIcon}>🏸</span>
            4-6岁启蒙
          </Link>
        </div>
      </div>
    </header>
  );
}

function UsageGuide() {
  return (
    <section className={styles.usageGuide}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          📖 使用指南
        </Heading>
        <div className={styles.guideGrid}>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>🎓</div>
            <Heading as="h3" className={styles.guideTitle}>教练使用</Heading>
            <ol className={styles.guideList}>
              <li>根据学员年龄段，选择对应的训练内容板块</li>
              <li>参考详细的训练方案和教学步骤</li>
              <li>结合理论知识，优化训练计划</li>
              <li>分享链接给家长，促进家校配合</li>
            </ol>
          </div>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>👨‍👩‍👧‍👦</div>
            <Heading as="h3" className={styles.guideTitle}>家长使用</Heading>
            <ol className={styles.guideList}>
              <li>了解孩子所在年龄段的训练重点</li>
              <li>学习营养搭配和损伤预防知识</li>
              <li>在家协助孩子完成体能训练</li>
              <li>掌握正确的心理引导方法</li>
            </ol>
          </div>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>🏃</div>
            <Heading as="h3" className={styles.guideTitle}>运动员使用</Heading>
            <ol className={styles.guideList}>
              <li>浏览自己年龄段的训练内容</li>
              <li>观看技术动作要领和示范图片</li>
              <li>学习战术理论和比赛策略</li>
              <li>培养自主学习和训练的能力</li>
            </ol>
          </div>
          <div className={styles.guideCard}>
            <div className={styles.guideIcon}>🔍</div>
            <Heading as="h3" className={styles.guideTitle}>快速导航</Heading>
            <ul className={styles.guideList}>
              <li>使用顶部<strong>搜索功能</strong>快速查找内容</li>
              <li>点击左侧<strong>侧边栏</strong>浏览完整目录</li>
              <li>每篇文章都包含训练目的和科学依据</li>
              <li>支持收藏、分享，随时随地学习</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="首页"
      description="专业的青少年羽毛球训练知识库，覆盖4-15岁全年龄段，包含体能、技术、战术、心理、营养等全方位训练内容">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
        <UsageGuide />
      </main>
    </Layout>
  );
}
