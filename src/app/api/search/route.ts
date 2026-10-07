import { NextResponse } from 'next/server';

import { getAvailableApiSites, getCacheTime } from '@/lib/config';
import { searchFromApi } from '@/lib/downstream';
import { SearchResult } from '@/lib/types';

export const runtime = 'edge';

// 影視常見繁簡映射庫
const DICT_T =
  '萬與醜專業叢東絲丟兩嚴喪個丱豐臨為麗舉麼義烏樂喬習鄉書買亂爭於虧雲亙亞產畝親褻嚲億僅從崙倉儀們價眾優儷儺儷儼儻儐僥兒兗內兩冊寫軍農冬馮沖決況凍淨淒涼凌減湊凜幾鳳處凱憑出擊鑿劃劉則剛創刪別刬劄劊劇劉劓劑力勸辦功加務劣動助努劫劬劭勵勁勞協單賣博印廠歷厲壓厭厙廁廂厴厭參又叉及友雙反發變敘疊葉號司各合吉同名後吏向吒呂周呱味呵咈咀呻呼鳴咄咒咆咋咕咖啡咘咚呢呿呱味呵咈咀呻呼鳴咄咒咆咋咕咖啡咘咚呢呿嚨嚌嚀響嚮啞噠嘩噝噠噸噹嚀嚇嚏嚐嘮噅噠嚀嚕嚴嚶囊囑囂囁囍囈嚷嚼囊囉囡團圓圈國圖聖堂場塢塊塋塚塢報場堤堰報場報場塵塹墊墜墮墳墾壁壇壓壘壞壟壤壢壯聲殼壹壺處備復頭夸夾奇奈奉奎契奔奧獎奪奮女奴奶奸她好如妃妄妝婦媽妊妍妒妓妖妗妹妻妾姆姊始姐姑姒姓委姚姜姥姨姪姬娘娉娛娜娟娠娣娥娩娛嫻娶娼婀婁婆婉婊婢婦媧媚媛嬪嬸婷婿媒媚嫁嫂嫉嫉媳媸媽媺嫋嫌嬪嫖嫖嫪媼媽嫚嬤嬸嬴孀嬌嬾孃孅嬰子孑孔孕字存孫孝孟季孤孩孫孰孱孳孵學孺孫宅宇守安宋完宏宓宗官宙定宛宜寶實寵審客宣室宦憲宮家宰害宴宵家宸容寂冤寄寅密寇富寐寒寞寢察寡寢寤寥實寧寨審寫寬寰寵寶寵寵寸寺尋導壽封射將專尉尊尋對導小少爾尕尖塵尚嘗尩尤尷就尺尼尾尿局屁屆居屈屋屍屎屏屐屜屢層屜履屬屬履屯山屹峪岐岑岡島峽峨島峻峽峨峰島峻島峰島峻崆崇崑崎崑崙崖崗嵐崗嶺嶇嵊嵩嵬嶽巔巒巖巢工巨差己已巳巴巷市布帥師希席帳帶帷常帽幬幌幄幅幌幫幌幹平年并幸麼廣床庇廬庭庫庶康庸廂廈廉廊廡廓廖廚廛廢廟廠廬廳廬廳弒彌彎彈弦弧弩弒弱張強彌弼強彗彙彈彌彎彝彙彌形彥彬彩彫彭彰影彷役徹彼往征徑徒得從御徠復循微徵德徹徽應心必忌忍忐忑忒志忘忙忝忠忡忤憂忪快忮念忽忿懷態態怩怫怠怪怯急恁怨怔怖怒思怠怡怪急懟戀恒恍恐恕恙恚恥恨恩恪恫恬恭息懇惡惱慍惲惻惱悶愴慟惻惲愉悽惜悵悲悶惱愎懲惻惺惛惶懼惻憫惡憲憒憤憫懇慾慼感慍惻愛慄慊慇慍慯態慪慫慼慬慳慴慶慷慾憂憊憎憐憑憔憊憫憚憮憑憊憫憲憶憸憫憒懵懌懇憤懍懂禮懃憾懔憫懼慘懟懣懞懲懨懦懵懶懷懸懺懼懾懿戀戇戈戔我戒戢戳戴戶扁扇扉手才撲打批折扭拔挑挢搗挫捉掤捫捻捷揭揮揉掽搜描搶摜摘摋擇摯撬播擄撈撐撰撥撫撕擴擲擺擾擔據擠擷擰獲攆攏攜攝攢攔櫻攤攛攪攬攙收攻攸故敏救敕敖敗敘敏救敞敕敢敦敬敟散敤數敲整敷斃文斕斑文斗料斛斜斟斡斧斬斯斷方於於於於旆旁旄旅旋旌旎族旒旗旖旛旒無既日旦舊旨旱時晃晉晝晞晚晰晡景普晴晶智暫暉暮暖暗暘曌暄暝暢暨暫暮暱暴暹曉曇歷曆曇曠曬曩曝月有朋服朔朗望朝期朦朧木未末本札術朱東松板析枉枕林枚果枝樞枵枯枳架枸柁柄查相柿柴柵栗校桂桃株核根格栽桀桐桓桔桃桌桂梗桎梢桶梅棒棱棗棘棟棠棧森棹植物椏椎棉棋棍棒棻森棱棲棵棹棉棕棗棘棍棒棉椅棋棟棠棗棧棉棹棗森棋棻棲棟棧森棹棒椎棉森棟棲桌棋棍棡棉森棲棧棗棹棋棧棟森棱棲棹棧棠棗椒森棒椎棱梓棉棟棋棟棚森棧棧棧櫬欖櫚櫸櫸櫥櫺櫻鬱欠次欣歐欲歎歐款歇歉歌歎歐歎歡止正此步武死殲殀歿殘殉殤殘殞殞殤殘殮殭殯殲殳段毀毆母每毒毓比毖毗毛氈毿毯氅毫毽氈氣氟氖氨氫氤氳氣氫氣水氾汀求汲汗汛汝汎池汝江汪汪沙沈沈汾溝泥河波注沱油泗泱泰泳洗津洛洞洗洋洒洪流洲洮涇浥浦浩湧涌浚涇涵浪流涎浴浸浣海涓涌浹涅涇海涌浦浩消涉海湧涎涑浸涇渦涔涇流浦海浪消涇浣涅海浪浸浹浦海涓浩消涵浬涑涇涓流濤涸涇涼淑淒涸淖渚淞淇淘淚淚淝淵淥漸渚淶淖渙潘淘涯淙淄淀涵淺涸涼淥渙漸淚渴濟涉瀋滄淮淝淵渚淇渴濟涉涼漸涸淮清淡涼淇淦淚渚涸漸淮淺淥涸渙涼淀渚淚涼淦淥渾深淮涵清涼淘淡淪渚淵涸漸瀋淥渙渚渟清涼涵淺淞涸渚涼淙淨涸渙淘淚涼淥瀋漸渴濟淮涉涼涸渙渚淇涼涇淺涸淚涼淮漸涼涸渚淚淥涼渚瀋渴濟漸涇涼涸涵淥渚淚涼淮涼瀋涼涸渚涼淚涼瀋漸涼涸涇涼渚淚涼淮涼涇涸涵渚涼淚涼瀋漸涼涇涸涼渚淚涼淮涼涇涸涵渚涼淚涼瀋漸涼涇涸涼渚淚涼淮涼涇涸涵渚涼淚涼瀋漸涼涇涸涼渚淚涼淮涼涇涸涵渚涼淚涼瀋漸';
const DICT_S =
  '万与丑专业丛东丝丢两严丧个丬丰临为丽举么义乌乐乔习乡书买乱争于亏云亘亚产亩亲亵朵亿仅从仑仓仪们价众优俪傩俪俨傥嫔侥儿兖内两册写军农冬冯冲决况冻净凄凉凌减凑凛几凤处凯凭出击凿划刘则刚创删别刬札刽剧刘劓剂力劝办功加务劣动助努劫劬劭励劲劳协单卖博印厂历厉压厌厙厕厢厴厌参又叉及友双反发变叙叠叶号司各合吉同名后吏向吒吕周呱味呵咈咀呻呼鸣咄咒咆咋咕咖啡咘咚呢呿呱味呵咈咀呻呼鸣咄咒咆咋咕咖啡咘咚呢呿咙哜咛响向哑哒哗嘶哒吨当咛吓嚏尝唠噅哒咛噜严嘤囊嘱嚣 whispered囍呓嚷嚼囊啰囡团圆圈国图圣堂场坞块莹冢坞报场堤堰报场报场尘堑垫坠堕坟垦壁坛压垒坏垄壤坜壮声壳壹壶处备复头夸夹奇奈奉奎契奔奥奖夺奋女奴奶奸她好如妃妄妆妇妈妊妍妒妓妖妗妹妻妾姆姊始姐姑姒姓委姚姜姥姨侄姬娘娉娱娜娟娠娣娥娩娱娴娶娼婀娄婆婉婊婢妇娲媚媛嫔婶婷婿媒媚嫁嫂嫉嫉媳媸妈媺袅嫌嫔嫖嫖嫪媼妈嫚嬷婶嬴孀娇懒娘纤婴子孑孔孕字存孙孝孟季孤孩孙孰孱孳孵学孺孙宅宇守安宋完宏宓宗官宙定宛宜宝实宠审客宣室宦宪宫家宰害宴宵家宸容寂冤寄寅密寇富寐寒寞寝察寡寝寤寥实宁寨审写宽寰宠宝宠宠寸寺寻导寿封射将专尉尊寻对导小少尔尕尖尘尚尝尩尤尴就尺尼尾尿局屁届居屈屋尸屎屏屐屉屡层屉履属属履屯山屹峪岐岑冈岛峡峨岛峻峡峨峰岛峻岛峰岛峻崆崇昆崎昆仑崖岗岚岗岭岖嵊嵩嵬岳巅峦岩巢工巨差己已巳巴巷市布帅师希席帐带帷常帽帱幌幄幅幌帮幌干平年并幸么广床庇庐庭库庶康庸厢厦廉廊庑廓廖厨廛废庙厂庐厅庐厅弑弥弯弹弦弧弩弑弱张强弥弼强彗汇弹弥弯彝汇弥形彦彬彩雕彭彰影彷役彻彼往征径徒得从御徕复循微征德彻徽应心必忌忍忐忑忒志忘忙忝忠忡忤忧忪快忮念忽忿怀态态怩怫怠怪怯急恁怨怔怖怒思怠怡怪急怼恋恒恍恐恕恙恚耻恨恩恪恫恬恭息恳恶恼愠恽恻恼闷怆恸恻恽愉凄惜怅悲闷恼愎惩恻惺惛惶惧恻悯恶宪匮愤悯恳欲戚感愠恻爱栗慊慇愠慯态慪怂戚慬悭慑庆慷欲忧惫憎怜凭憔惫悯惮怃凭惫悯宪忆憸悯匮懵怿恳愤懍懂礼懃憾懔悯惧惨怼懑懞惩恹懦懵懒怀悬忏惧慑懿恋戆戈戋我戒戢戳戴户扁扇扉手才扑打批折扭拔挑挢捣挫捉掤扪捻捷揭挥揉掽搜描抢摜摘摋择挚撬播掳捞撑撰拨抚撕扩掷摆扰担据挤撷拧获撵拢携摄攒拦樱摊攛搅揽搀收攻攸故敏救敕敖败叙敏救敞敕敢敦敬敟散敤数敲整敷毙文斓斑文斗料斛斜斟斡斧斩斯断方于于于于旆旁旄旅旋旌旎族旒旗旖旛旒无既日旦旧旨旱时晃晋昼晞晚晰晡景普晴晶智暂晖暮暖暗旸曌暄暝畅暨暂暮暱暴暹晓昙历历昙旷晒曩曝月有朋服朔朗望朝期朦胧木未末本札术朱东松板析枉枕林枚果枝枢枵枯枳架枸柁柄查相柿柴栅栗校桂桃株核根格栽桀桐桓桔桃桌桂梗桎梢桶梅棒棱枣棘栋棠栈森棹植物桠椎棉棋棍棒棻森棱栖棵棹棉棕枣棘棍棒棉椅棋栋棠枣栈棉棹枣森棋棻栖栋栈森棹棒椎棉森栋栖桌棋棍棡棉森栖栈枣棹棋栈栋森棱栖棹栈棠枣椒森棒椎棱梓棉栋棋栋棚森栈栈栈榇榄榈榉榉橱棂樱郁欠次欣欧欲叹欧款歇歉歌叹欧叹欢止正此步武死歼殀殁残殉殇残殒殒殇残殓僵殡歼殳段毁殴母每毒毓比毖毗毛毡毿毯氅毫毽毡气氟氖氨氢氤氲气氢气水氾汀求汲汗汛汝汎池汝江汪汪沙沈沈汾沟泥河波注沱油泗泱泰泳洗津洛洞洗洋洒洪流洲洮泾浥浦浩涌涌浚泾涵浪流涎浴浸浣海涓涌浃涅泾海涌浦浩消涉海涌涎涑浸泾涡涔泾流浦海浪消泾浣涅海浪浸浃浦海涓浩消涵浬涑泾涓流涛涸泾凉淑凄涸淖渚淞淇淘泪泪淝渊淥渐渚涞淖涣潘淘涯淙淄淀涵浅涸凉淥涣渐泪渴济涉沈沧淮淝渊渚淇渴济涉凉渐涸淮清淡凉淇淦泪渚涸渐淮浅淥涸涣凉淀渚泪凉淦淥浑深淮涵清凉淘淡沦渚渊涸渐沈淥涣渚渟清凉涵浅淞涸渚凉淙净涸涣淘泪凉淥沈渐渴济淮涉凉涸涣渚淇凉泾浅涸泪凉淮渐凉涸渚泪淥凉渚沈渴济渐泾凉涸涵淥渚泪凉淮凉沈凉涸渚凉泪凉沈渐凉涸泾凉渚泪凉淮凉泾涸涵渚凉泪凉沈渐凉泾涸凉渚泪凉淮凉泾涸涵渚凉泪凉沈渐凉泾涸凉渚泪凉淮凉泾涸涵渚凉泪凉沈渐凉泾涸凉渚泪凉淮凉泾涸涵渚泪凉沈渐';

function convertToSimplified(text: string): string {
  return text
    .split('')
    .map((char) => {
      const idx = DICT_T.indexOf(char);
      return idx !== -1 ? DICT_S[idx] : char;
    })
    .join('');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawQuery = searchParams.get('q');

  if (!rawQuery) {
    const cacheTime = await getCacheTime();
    return NextResponse.json(
      { results: [] },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}`,
        },
      }
    );
  }

  const trimmedQuery = rawQuery.trim();
  const simplifiedQuery = convertToSimplified(trimmedQuery);

  // 1. 建立搜尋候選詞清單
  const queryCandidates: string[] = [trimmedQuery, simplifiedQuery];

  // 2. 如果關鍵字大於 2 個字（例如「早春晴朗」），加入後兩字（「晴朗」）與前兩字（「早春」）作為備援
  if (simplifiedQuery.length > 2) {
    queryCandidates.push(simplifiedQuery.slice(-2)); // '晴朗'
    queryCandidates.push(simplifiedQuery.slice(0, 2)); // '早春'
  }

  const uniqueQueries = Array.from(new Set(queryCandidates.filter(Boolean)));
  const apiSites = await getAvailableApiSites();

  try {
    // 依序搜尋，優先搜尋完整詞，若找到匹配項就直接返回
    let allFound: SearchResult[] = [];

    // 第一階段：先搜完整詞
    const primaryQueries = [trimmedQuery, simplifiedQuery];
    const primaryTasks = Array.from(new Set(primaryQueries)).flatMap((q) =>
      apiSites.map((site) => searchFromApi(site, q))
    );
    const primaryResults = (await Promise.all(primaryTasks)).flat();

    if (primaryResults.length > 0) {
      allFound = primaryResults;
    } else {
      // 第二階段備援：若完整詞在採集站搜不到，觸發切詞搜尋（如「晴朗」）
      const fallbackQueries = uniqueQueries.filter(
        (q) => !primaryQueries.includes(q)
      );
      const fallbackTasks = fallbackQueries.flatMap((q) =>
        apiSites.map((site) => searchFromApi(site, q))
      );
      const fallbackResults = (await Promise.all(fallbackTasks)).flat();

      // 在切詞搜到的廣泛結果中，過濾出片名有包含原本搜尋詞（例如包含「早春」或「晴朗」）的片
      const matched = fallbackResults.filter((item) => {
        const itemTitle = item.title.replaceAll(' ', '');
        return (
          itemTitle.includes(simplifiedQuery) ||
          itemTitle.includes(trimmedQuery) ||
          simplifiedQuery.includes(itemTitle)
        );
      });

      allFound = matched.length > 0 ? matched : fallbackResults;
    }

    // 依據 source + id 去重
    const seen = new Set<string>();
    const deduplicatedResults: SearchResult[] = [];

    for (const item of allFound) {
      const key = `${item.source}-${item.id}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduplicatedResults.push(item);
      }
    }

    const cacheTime = await getCacheTime();

    return NextResponse.json(
      { results: deduplicatedResults },
      {
        headers: {
          'Cache-Control': `public, max-age=${cacheTime}`,
        },
      }
    );
  } catch (error) {
    return NextResponse.json({ error: '搜索失败' }, { status: 500 });
  }
}
