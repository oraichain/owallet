import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState
} from 'react';
import { Image, View } from 'react-native';
import { CText as Text } from '../../components/text';
import { useStyle } from '../../styles';
import { BrowserSectionTitle } from './components/section-title';
import { RemoveIcon, SwapIcon } from '../../components/icon';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { useStore } from '../../stores';
import { observer } from 'mobx-react-lite';
import { PageWithScrollView } from '../../components/page';
import { checkValidDomain } from '../../utils/helper';
import { useNavigation } from '@react-navigation/native';
import DraggableFlatList from 'react-native-draggable-flatlist';

export const BrowserSection: FunctionComponent<{}> = ({}) => {
  const style = useStyle();
  return (
    <React.Fragment>
      <View
        style={style.flatten([
          'width-full',
          'height-66',
          'flex-row',
          'justify-between',
          'items-center',
          'padding-20'
        ])}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: '500',
            color: '#1C1C1E'
          }}
        >
          All bookmarks
        </Text>
      </View>
      <View
        style={style.flatten([
          'height-1',
          'margin-x-20',
          'background-color-border-white'
        ])}
      />
    </React.Fragment>
  );
};

export const BookMarks: FunctionComponent<any> = observer(() => {
  const style = useStyle();
  const { browserStore } = useStore();
  const [isOpenSetting] = useState(false);
  const navigation = useNavigation();
  const [data, setData] = useState([]);

  const removeBookmark = bm => {
    const tmpData = [...data];
    const rIndex = tmpData.findIndex(b => b.uri === bm.uri);
    if (rIndex > -1) {
      tmpData.splice(rIndex, 1);
    }
    setData(tmpData);
    browserStore.removeBoorkmark(bm);
  };

  useEffect(() => {
    setData(browserStore.getBookmarks);
  }, []);

  const onHandleUrl = uri => {
    let currentUri = uri;
    if (currentUri !== '') {
      if (checkValidDomain(currentUri?.toLowerCase())) {
        const tab = {
          id: Date.now(),
          name: currentUri,
          uri:
            currentUri?.toLowerCase().indexOf('http') >= 0
              ? currentUri?.toLowerCase()
              : 'https://' + currentUri?.toLowerCase()
        };

        let tabOpened = browserStore.checkTabOpen(tab);
        browserStore.updateSelectedTab(tabOpened ?? tab);
        if (!!!tabOpened) {
          browserStore.addTab(tab);
        }
        navigation.navigate('Web.dApp', tab);
      }
    }
  };

  const renderItem = useCallback(({ item, drag, isActive }) => {
    return (
      <TouchableOpacity
        style={style.flatten([
          'height-44',
          'margin-bottom-20',
          'flex-row',
          'items-center',
          'justify-between'
        ])}
        onPress={() => {
          onHandleUrl(item.uri);
        }}
        onLongPress={drag}
      >
        <View style={style.flatten(['flex-row'])}>
          <View style={style.flatten(['padding-top-5'])}>
            <Image
              style={{
                width: 20,
                height: 22
              }}
              source={item.logo}
              fadeDuration={0}
            />
          </View>
          <View style={style.flatten(['padding-x-15'])}>
            <Text style={style.flatten(['subtitle2'])}>{item.name}</Text>
            <Text style={{ color: '#636366', fontSize: 14 }}>{item.uri}</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <SwapIcon color={isActive ? '#945EF8' : '#C7C7CC'} />
          <TouchableOpacity
            style={{ paddingLeft: 12 }}
            onPress={() => removeBookmark(item)}
          >
            <RemoveIcon />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }, []);

  return (
    <PageWithScrollView>
      <View style={{ opacity: isOpenSetting ? 0.8 : 1 }}>
        <BrowserSectionTitle title="" />
        <View style={style.flatten(['height-full', 'background-color-white'])}>
          <BrowserSection />
          <View style={style.flatten(['height-full', 'padding-20'])}>
            <DraggableFlatList
              data={data}
              onDragEnd={({ data }) => {
                browserStore.updateBookmarks(data);
                setData(data);
              }}
              keyExtractor={(item: any) => item?.uri}
              renderItem={renderItem}
            />
          </View>
        </View>
      </View>
    </PageWithScrollView>
  );
});
