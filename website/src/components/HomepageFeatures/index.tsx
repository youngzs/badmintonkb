import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
  link?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: '科学年龄分段',
    emoji: '🎯',
    description: (
      <>
        根据青少年生长发育特点，划分为<strong>4个训练阶段</strong>：
        4-6岁启蒙期 | 7-9岁基础期 | 10-12岁发展期 | 13-15岁专项期
      </>
    ),
    link: '/docs',
  },
  {
    title: '全面知识体系',
    emoji: '📚',
    description: (
      <>
        涵盖<strong>18个专业板块</strong>：
        体能训练、技战术、理论知识、心理训练等全方位训练指导
      </>
    ),
    link: '/docs/theory/technical-mechanics/badminton-technique-principles',
  },
  {
    title: '多角色适用',
    emoji: '👥',
    description: (
      <>
        为<strong>教练、家长、运动员</strong>量身打造，
        提供完整教学方案、训练计划和学习资源
      </>
    ),
  },
];

function Feature({title, emoji, description, link}: FeatureItem) {
  const getIconStyle = (index: number) => {
    const iconStyles = [
      {background: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'}, // 粉色渐变
      {background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'}, // 绿色渐变
      {background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'}, // 紫色渐变
    ];
    return iconStyles[index % 3];
  };

  const content = (
    <div className={styles.featureCol}>
      <div className={clsx('card', styles.featureCard)}>
        <div className={styles.featureIcon} style={getIconStyle(FeatureList.findIndex(f => f.title === title))}>
          <span className={styles.iconEmoji}>{emoji}</span>
        </div>
        <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
        <p className={styles.featureDescription}>{description}</p>
      </div>
    </div>
  );

  return link ? (
    <Link to={link} className={styles.featureLink}>
      {content}
    </Link>
  ) : content;
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
